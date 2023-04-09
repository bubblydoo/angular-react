import * as ng from "@angular/core";
import React from "react";
import { useContext, useState, useEffect } from "react";
import { AngularModuleContext } from "../angular-context/angular-context";
import { ReactToTemplateRefComponent } from "./react-to-template-ref.component";
import { InjectableReactContextToken } from "../injectable-react-context/react-context-token";
import { InjectableReactContext, useInjectableReactContext } from "../injectable-react-context/use-injectable-react-context";
import { IsTopLevelReactToken } from "./is-top-level-react-token";
import { createRoot } from "react-dom/client";
import { InTreeCreateRootToken } from "../use-in-tree-create-root/in-tree-create-root-token";
import { useInTreeCreateRoot } from "../use-in-tree-create-root/use-in-tree-create-root";

/**
 * Create a template ref from a React component.
 *
 * This template is meant to be used in a `[ngTemplateOutlet]` where `[ngTemplateOutletInjector]` is defined.
 * If you can't define `[ngTemplateOutletInjector]`, use `useToAngularTemplateRefBoundToContextAndPortals`.
 */
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
    moduleRef
  );
}

/**
 * Create a template ref from a React component.
 * The template ref is bound to the context of where this hook is called.
 * Because of this, you don't need `[ngTemplateOutletInjector]` on the `<ng-container>`.
 * This hook returns `[templateRef, portals]`.
 * Make sure the portals are rendered somewhere in your tree: `<>{portals}</>`.
 */
export function useToAngularTemplateRefBoundToContextAndPortals<C>(
  Component: (props: C) => any,
) {
  const moduleRef = useContext(AngularModuleContext);
  if (!moduleRef)
    throw new Error(
      "useToAngularTemplateRef must be used within an AngularModuleContext"
    );

  const injectableReactContext = useInjectableReactContext();
  const inTreeCreateRoot = useInTreeCreateRoot();

  const templateRef = useToAngularTemplateRefWithModule(
    Component,
    moduleRef,
    injectableReactContext,
    inTreeCreateRoot.createRoot
  );

  return [templateRef, inTreeCreateRoot.portals] as const;
}

export function useToAngularTemplateRefWithModule<C>(
  Component: (props: C) => any,
  ngModuleRef: ng.NgModuleRef<any>,
  injectableReactContext?: InjectableReactContext,
  inTreeCreateRoot?: typeof createRoot
): ng.TemplateRef<C> | undefined {
  const [templateRef, setTemplateRef] = useState<ng.TemplateRef<C>>();
  const [updateComponent, setUpdateComponent] =
    useState<(component: (props: C) => any) => void>();

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    createReactWrapperTemplateRef<C>(
      ngModuleRef,
      controller.signal,
      injectableReactContext,
      inTreeCreateRoot
    ).then(({ templateRef, updateComponent }) => {
      if (ignore) return;
      setTemplateRef(templateRef);
      setUpdateComponent(() => updateComponent);
    });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [ngModuleRef, injectableReactContext, inTreeCreateRoot]);

  useEffect(() => {
    if (!Component || !updateComponent) return;
    updateComponent((props: any) => <Component {...props} />);
  }, [Component, updateComponent]);

  return templateRef;
}

export async function createReactWrapperTemplateRef<C = any>(
  ngModuleRef: ng.NgModuleRef<any>,
  abortSignal?: AbortSignal,
  injectableReactContext?: InjectableReactContext,
  inTreeCreateRoot?: typeof createRoot
) {
  const el = document.createElement("div");

  const componentFactory =
    ngModuleRef.componentFactoryResolver.resolveComponentFactory<
      ReactToTemplateRefComponent<C>
    >(ReactToTemplateRefComponent);

  const providers: ng.StaticProvider[] = [
    { provide: IsTopLevelReactToken, useValue: false },
  ];

  if (injectableReactContext) {
    providers.push({
      provide: InjectableReactContextToken,
      useValue: injectableReactContext,
    });
  }
  if (inTreeCreateRoot) {
    providers.push({
      provide: InTreeCreateRootToken,
      useValue: inTreeCreateRoot,
    });
  }

  const injectorForComponent = ng.Injector.create({
    providers,
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
    createEmbeddedView(context, injector) {
      const viewRef = origTemplateRef.createEmbeddedView(
        { props: context },
        injector
      );

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
