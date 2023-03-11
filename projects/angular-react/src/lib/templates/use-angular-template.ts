import { TemplateRef, NgModuleRef, EmbeddedViewRef, ApplicationRef, ComponentRef } from "@angular/core";
import { useContext, useState, useEffect, useMemo } from "react";
import { AngularModuleContext } from "../angular-module-context/angular-module-context";
import { ReactToTemplateRefComponent } from "./react-to-template-ref.component";

export function useAngularTemplate<C>(tmpl: (props: C) => any): TemplateRef<C> | undefined {
  const moduleRef = useContext(AngularModuleContext);
  if (!moduleRef) throw new Error('useAngularTemplate must be used within an AngularModuleContext');
  return useAngularTemplateWithModule(tmpl, moduleRef);
}

export function useAngularTemplateWithModule<C>(tmpl: (props: C) => any, ngModuleRef: NgModuleRef<any>): TemplateRef<C> | undefined {
  const [templateRef, setTemplateRef] = useState<TemplateRef<{ props: C }>>();
  const [componentRef, setComponentRef] = useState<ComponentRef<ReactToTemplateRefComponent<C>>>();
  const [viewRefs, setViewRefs] = useState<EmbeddedViewRef<{ props: C }>[]>([]);

  useEffect(() => {
    let ignore = false;
    const el = document.createElement('div');
    const componentFactory =
      ngModuleRef.componentFactoryResolver.resolveComponentFactory<ReactToTemplateRefComponent<C>>(
        ReactToTemplateRefComponent
      );
    const componentRef = componentFactory.create(ngModuleRef.injector, [], el);
    setComponentRef(componentRef);
    componentRef.instance.templateRefPromise.then((templateRef) => {
      if (ignore) return;
      setTemplateRef(templateRef);
    });

    const appRef = ngModuleRef.injector.get(ApplicationRef);
    appRef.attachView(componentRef.hostView);

    return () => {
      ignore = true;
      componentRef.destroy();
      el.remove();
    };
  }, [ngModuleRef]);

  useEffect(() => {
    if (!componentRef || !tmpl) return;

    componentRef.instance.component = tmpl;
    // without this, ngAfterViewInit never gets called
    componentRef.changeDetectorRef.detectChanges();
  }, [componentRef, tmpl, viewRefs]);

  const propsTemplateRef = useMemo(() => {
    if (!templateRef) return;

    // we wrap the templateRef for two reasons:
    // 1. we remap viewProps.context to context.props, so it can be used with `let-props="props"`
    //    (there is no way to get the whole context on an ng-template, only individiual attributes)
    // 2. we need to keep track of the viewRefs associated with this templateRef,
    //    so we can call detectChanges on it when the react tmpl changes
    //    (kinda hacky, but it works)

    const newTemplateRef: TemplateRef<C> = {
      get elementRef() {
        return templateRef.elementRef;
      },
      createEmbeddedView(context) {
        const viewRef = templateRef.createEmbeddedView({ props: context });

        setViewRefs(viewRefs => [...viewRefs, viewRef]);
        viewRef.onDestroy(() => {
          setViewRefs(viewRefs => viewRefs.filter(vr => vr !== viewRef));
        });

        const origContextDescriptor = Object.getOwnPropertyDescriptor(viewRef.constructor.prototype, 'context')!;
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

    return newTemplateRef;
  }, [templateRef]);

  useEffect(() => {
    // this will be called when tmpl changes (kinda hacky)
    viewRefs.forEach(viewRef => viewRef.detectChanges());
  }, [tmpl, viewRefs]);

  return propsTemplateRef;
}
