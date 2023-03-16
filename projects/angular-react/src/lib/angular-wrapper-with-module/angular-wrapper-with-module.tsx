import * as ng from "@angular/core";
import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import ReactDOM from "react-dom";
import { Subscribable, Unsubscribable } from "rxjs";
import { PassedReactContextToken } from "../passed-react-context-token/passed-react-context-token";
import { useCreatePassedReactContext } from "../passed-react-context-token/use-create-passed-react-context";

function AngularWrapperWithModule(
  {
    name: ngComponentName,
    component: ngComponent,
    moduleRef: ngModuleRef,
    inputs,
    events,
    outputs,
    children,
  }: {
    name?: string;
    component: any;
    moduleRef: ng.NgModuleRef<any>;
    inputs?: Record<string, any>;
    events?: Record<string, (ev: Event) => any>;
    outputs?: Record<string, (value: any) => any>;
    children?: any;
  },
  forwardedRef: ForwardedRef<ng.ComponentRef<any>>
) {
  if (!ngComponent)
    throw new Error(
      "AngularWrapperWithModule needs a component but none was provided"
    );

  const [componentFactory, setComponentFactory] =
    useState<ng.ComponentFactory<any> | null>(null);
  const [renderedComponent, setRenderedComponentRef] =
    useState<ng.ComponentRef<any> | null>(null);
  const [renderedElement, setRenderedElement] =
    useState<HTMLElement | null>(null);

  // TODO: for more compat see @angular/elements
  // https://github.com/angular/angular/blob/4332897baa2226ef246ee054fdd5254e3c129109/packages/elements/src/component-factory-strategy.ts#L200

  const hasChildren = !!children;
  const ngContentContainerEl = useMemo<HTMLDivElement | null>(() => {
    if (hasChildren) return document.createElement("div");
    return null;
  }, [hasChildren]);

  const passedReactContext = useCreatePassedReactContext();

  /** This effect makes sure event listeners like 'click' are registered when the element is rendered */
  useEffect(() => {
    if (!events) return;
    if (!renderedElement) return;
    if (!ngModuleRef) return;

    const ngZone = ngModuleRef.injector.get(ng.NgZone);

    const localEl = renderedElement;

    // sometimes the event handlers are executed in the Angular zone, sometimes they're not
    // we make sure they're always in the Angular zone
    const ngZonedEvents: typeof events = {};

    for (const eventKey in events) {
      const handler = events[eventKey];
      ngZonedEvents[eventKey] = (ev) => {
        ngZone.run(() => handler(ev));
      };
    }

    for (const event in ngZonedEvents) {
      localEl.addEventListener(event, ngZonedEvents[event]);
    }
    return () => {
      for (const event in ngZonedEvents) {
        localEl.removeEventListener(event, ngZonedEvents[event]);
      }
    };
  }, [renderedElement, events, ngModuleRef]);

  const elRef = useCallback<(node: HTMLElement) => void>(
    async (node) => {
      if (node === null) return;
      setRenderedElement(node);
      const projectableNodes = ngContentContainerEl
        ? [[ngContentContainerEl]]
        : [];
      const componentFactory =
        ngModuleRef.componentFactoryResolver.resolveComponentFactory(
          ngComponent
        );

      // extend the injector with our passed react context
      // so the nested react-wrappers can access it
      const injectorForComponent = ng.Injector.create({
        providers: [
          { provide: PassedReactContextToken, useValue: passedReactContext },
        ],
        parent: ngModuleRef.injector,
      });

      const componentRef = componentFactory.create(
        injectorForComponent,
        projectableNodes,
        node
      );

      const appRef = ngModuleRef.injector.get(ng.ApplicationRef);
      appRef.attachView(componentRef.hostView);

      setComponentFactory(componentFactory);
      setRenderedComponentRef(componentRef);

      if (forwardedRef) {
        typeof forwardedRef === "function"
          ? forwardedRef(componentRef)
          : (forwardedRef.current = componentRef);
      }
    },
    // inputs doesn't need to be a dep, this is already handled in the next useEffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ngComponent, ngModuleRef, passedReactContext]
  );

  useEffect(() => {
    if (!renderedComponent) return;
    if (!componentFactory) return;

    // TODO: In Angular 14, there's a new `setInput` method on ComponentRef, which should be used
    for (const [key, value] of Object.entries(inputs || {})) {
      const inputSettings = componentFactory.inputs.find(
        ({ templateName }) => templateName === key
      );
      if (!inputSettings) throw new Error(`Unknown input: ${key}`);
      renderedComponent.instance[inputSettings.propName] = value;
    }
    // Somehow you can't just call detectChanges on renderedComponent.changeDetectorRef
    // The change detector is not the same as the one you would inject in the constructor
    // see https://github.com/angular/angular/issues/36667 and https://github.com/angular/angular/issues/18817
    // This will also be fixed when using `setInput`
    renderedComponent.injector.get(ng.ChangeDetectorRef).detectChanges();
    renderedComponent.changeDetectorRef.detectChanges();
  }, [renderedComponent, componentFactory, inputs]);

  useEffect(() => {
    if (!renderedComponent) return;
    if (!componentFactory) return;
    if (!outputs) return;
    if (!ngModuleRef) return;

    const ngZone = ngModuleRef.injector.get(ng.NgZone);

    const subscriptions: Unsubscribable[] = [];

    for (const [key, handler] of Object.entries(outputs || {})) {
      const outputSettings = componentFactory.outputs.find(
        ({ templateName }) => templateName === key
      );
      if (!outputSettings) throw new Error(`Unknown output: ${key}`);

      const outputEmitter: Subscribable<any> =
        renderedComponent.instance[outputSettings.propName];

      if (!outputEmitter)
        throw new Error(`Output not found: ${outputSettings.propName}`);

      const subscription = outputEmitter.subscribe({
        next: (value: any) => {
          // like the events, we make sure the output handlers are called in the Angular zone
          ngZone.run(() => handler(value));
        },
      });
      subscriptions.push(subscription);
    }

    return () => {
      for (const subscription of subscriptions) {
        subscription.unsubscribe();
      }
    };
  }, [renderedComponent, componentFactory, outputs, ngModuleRef]);

  useEffect(() => {
    if (!renderedComponent) return;
    return () => {
      renderedComponent!.destroy();
    };
  }, [renderedComponent]);

  let componentName = ngComponentName;
  if (!componentName) {
    componentName = ngComponent.ɵcmp?.selectors?.[0]?.[0];
    if (!componentName) {
      console.error(
        `Couldn't get component name from component`,
        ngComponent.ɵcmp
      );
      throw new Error(`Couldn't get component name from component`);
    } else if (!componentName.match(/^[a-z0-9-]+$/)) {
      console.error(
        `Couldn't use component selector as component name`,
        componentName
      );
      throw new Error(`Couldn't use component selector as component name`);
    }
  }

  return (
    <>
      {React.createElement(componentName, { ref: elRef })}
      {ngContentContainerEl &&
        ReactDOM.createPortal(<>{children}</>, ngContentContainerEl)}
    </>
  );
}

const AngularWrapperWithModuleForwardRef = forwardRef(AngularWrapperWithModule);

export { AngularWrapperWithModuleForwardRef as AngularWrapperWithModule };

