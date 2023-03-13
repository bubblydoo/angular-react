import {
  TemplateRef,
  NgModuleRef,
  EmbeddedViewRef,
  ApplicationRef,
  ComponentRef,
  ChangeDetectorRef,
} from '@angular/core';
import React from 'react';
import { useContext, useState, useEffect, useMemo } from 'react';
import { AngularModuleContext } from '../angular-module-context/angular-module-context';
import { ReactToTemplateRefComponent } from './react-to-template-ref.component';
import { useContextBridge } from 'its-fine';

export function useToAngularTemplateRef<C>(
  Component: (props: C) => any
): TemplateRef<C> | undefined {
  const moduleRef = useContext(AngularModuleContext);
  if (!moduleRef)
    throw new Error(
      'useToAngularTemplateRef must be used within an AngularModuleContext'
    );
  return useToAngularTemplateRefWithModule(Component, moduleRef);
}

export function useToAngularTemplateRefWithModule<C>(
  Component: (props: C) => any,
  ngModuleRef: NgModuleRef<any>
): TemplateRef<C> | undefined {
  const [templateRef, setTemplateRef] = useState<TemplateRef<C>>();
  const [updateComponent, setUpdateComponent] =
    useState<(component: (props: C) => any) => void>();

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    createReactWrapperTemplateRef<C>(ngModuleRef, controller.signal).then(
      ({ templateRef, updateComponent }) => {
        if (ignore) return;
        setTemplateRef(templateRef);
        setUpdateComponent(() => updateComponent);
      }
    );

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [ngModuleRef]);

  const ContextBridge = useContextBridge();

  useEffect(() => {
    if (!Component || !updateComponent) return;
    updateComponent((props: any) => <ContextBridge><Component {...props}/></ContextBridge>);
  }, [Component, updateComponent]);

  return templateRef;
}

export const createReactWrapperTemplateRef = async <C = any>(
  ngModuleRef: NgModuleRef<any>,
  abortSignal?: AbortSignal
) => {
  const el = document.createElement('div');

  const componentFactory =
    ngModuleRef.componentFactoryResolver.resolveComponentFactory<
      ReactToTemplateRefComponent<C>
    >(ReactToTemplateRefComponent);
  const componentRef = componentFactory.create(ngModuleRef.injector, [], el);

  const appRef = ngModuleRef.injector.get(ApplicationRef);
  appRef.attachView(componentRef.hostView);

  componentRef.injector.get(ChangeDetectorRef).detectChanges();
  componentRef.changeDetectorRef.detectChanges();

  const cleanup = () => {
    componentRef.destroy();
    el.remove();
  };

  abortSignal?.addEventListener('abort', cleanup);

  const origTemplateRef = await componentRef.instance.templateRefPromise;

  let viewRefs: EmbeddedViewRef<any>[] = [];

  // we wrap the templateRef for two reasons:
  // 1. we remap viewProps.context to context.props, so it can be used with `let-props="props"`
  //    (there is no way to get the whole context on an ng-template, only individiual attributes)
  // 2. we need to keep track of the viewRefs associated with this templateRef,
  //    so we can call detectChanges on it when the react component changes
  //    (kinda hacky, but it works)

  const templateRef: TemplateRef<C> = {
    get elementRef() {
      return origTemplateRef.elementRef;
    },
    createEmbeddedView(context) {
      const viewRef = origTemplateRef.createEmbeddedView({ props: context });

      viewRefs.push(viewRef);
      viewRef.onDestroy(() => {
        viewRefs = viewRefs.filter((vr) => vr !== viewRef);
      });

      const origContextDescriptor = Object.getOwnPropertyDescriptor(
        viewRef.constructor.prototype,
        'context'
      )!;
      Object.defineProperty(viewRef, 'context', {
        get() {
          return origContextDescriptor.get!.call(viewRef);
        },
        set(context) {
          origContextDescriptor.set!.call(viewRef, { props: context });
        },
        enumerable: origContextDescriptor.enumerable,
        configurable: origContextDescriptor.configurable,
      });

      return viewRef as any as EmbeddedViewRef<C>;
    },
  };

  const updateComponent = (component: (props: C) => any) => {
    componentRef.instance.component = component;
    // we first make sure the input is passed to the ng-template
    componentRef.injector.get(ChangeDetectorRef).detectChanges();
    componentRef.changeDetectorRef.detectChanges();
    // then we make sure all views associated with this ng-template are updated
    viewRefs.forEach((viewRef) => viewRef.detectChanges());
  };

  return { templateRef, cleanup, updateComponent };
};
