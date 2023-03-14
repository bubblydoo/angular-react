import * as ng from "@angular/core";
import React from "react";
import { useContext, useState, useEffect } from "react";
import { AngularModuleContext } from "../angular-module-context/angular-module-context";
import { ReactToTemplateRefComponent } from "./react-to-template-ref.component";
import { useContextBridge } from "@bubblydoo/its-fine";
import {
  PassedReactContext,
  PassedReactContextToken,
} from "../passed-react-context-token/passed-react-context-token";
import { useCreatePassedReactContext } from "../passed-react-context-token/use-create-passed-react-context";

export function useToAngularTemplateRef<C>(
  Component: (props: C) => any
): ng.TemplateRef<C> | undefined {
  const moduleRef = useContext(AngularModuleContext);
  if (!moduleRef)
    throw new Error(
      "useToAngularTemplateRef must be used within an AngularModuleContext"
    );
  return useToAngularTemplateRefWithModule(
    Component,
    moduleRef,
  );
}

export function useToAngularTemplateRefWithModule<C>(
  Component: (props: C) => any,
  ngModuleRef: ng.NgModuleRef<any>
): ng.TemplateRef<C> | undefined {
  const [templateRef, setTemplateRef] = useState<ng.TemplateRef<C>>();
  const [updateComponent, setUpdateComponent] =
    useState<(component: (props: C) => any) => void>();

  const passedReactContext = useCreatePassedReactContext();

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    createReactWrapperTemplateRef<C>(
      ngModuleRef,
      passedReactContext,
      controller.signal
    ).then(({ templateRef, updateComponent }) => {
      if (ignore) return;
      setTemplateRef(templateRef);
      setUpdateComponent(() => updateComponent);
    });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [ngModuleRef]);

  const ContextBridge = useContextBridge();

  useEffect(() => {
    if (!Component || !updateComponent) return;
    updateComponent((props: any) => (
      <ContextBridge>
        <Component {...props} />
      </ContextBridge>
    ));
  }, [Component, updateComponent]);

  return templateRef;
}

export async function createReactWrapperTemplateRef<C = any>(
  ngModuleRef: ng.NgModuleRef<any>,
  passedReactContext?: PassedReactContext,
  abortSignal?: AbortSignal
) {
  const el = document.createElement("div");

  const componentFactory =
    ngModuleRef.componentFactoryResolver.resolveComponentFactory<
      ReactToTemplateRefComponent<C>
    >(ReactToTemplateRefComponent);

  // Q: is it needed to put passedReactContext on the injector here,
  // considering we override the injector in AngularTemplateOutlet?
  const injectorForComponent = ng.Injector.create({
    providers: passedReactContext
      ? [{ provide: PassedReactContextToken, useValue: passedReactContext }]
      : [],
    parent: ngModuleRef.injector,
  });
  const componentRef = componentFactory.create(injectorForComponent, [], el);

  const appRef = ngModuleRef.injector.get(ng.ApplicationRef);
  appRef.attachView(componentRef.hostView);

  componentRef.injector.get(ng.ChangeDetectorRef).detectChanges();
  componentRef.changeDetectorRef.detectChanges();

  const cleanup = () => {
    componentRef.destroy();
    el.remove();
  };

  abortSignal?.addEventListener("abort", cleanup);

  const origTemplateRef = await componentRef.instance.templateRefPromise;

  let viewRefs: ng.EmbeddedViewRef<any>[] = [];

  // we wrap the templateRef for two reasons:
  // 1. we remap viewProps.context to context.props, so it can be used with `let-props="props"`
  //    (there is no way to get the whole context on an ng-template, only individiual attributes)
  // 2. we need to keep track of the viewRefs associated with this templateRef,
  //    so we can call detectChanges on it when the react component changes
  //    (kinda hacky, but it works)

  const templateRef: ng.TemplateRef<C> = {
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
        "context"
      )!;
      Object.defineProperty(viewRef, "context", {
        get() {
          return origContextDescriptor.get!.call(viewRef);
        },
        set(context) {
          origContextDescriptor.set!.call(viewRef, { props: context });
        },
        enumerable: origContextDescriptor.enumerable,
        configurable: origContextDescriptor.configurable,
      });

      return viewRef as any as ng.EmbeddedViewRef<C>;
    },
  };

  const updateComponent = (component: (props: C) => any) => {
    componentRef.instance.component = component;
    // we first make sure the input is passed to the ng-template
    componentRef.injector.get(ng.ChangeDetectorRef).detectChanges();
    componentRef.changeDetectorRef.detectChanges();
    // then we make sure all views associated with this ng-template are updated
    viewRefs.forEach((viewRef) => viewRef.detectChanges());
  };

  return { templateRef, cleanup, updateComponent };
}
