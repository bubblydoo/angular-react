import type * as ng from '@angular/core';
import React, { ForwardedRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

function AngularWrapperWithModule(
  {
    name: ngComponentName,
    component: ngComponent,
    moduleRef: ngModuleRef,
    inputs,
    events,
    children,
  }: {
    name?: string;
    component: any;
    moduleRef: ng.NgModuleRef<any>;
    inputs?: Record<string, any>;
    events?: Record<string, (ev: Event) => any>;
    children?: any;
  },
  forwardedRef: ForwardedRef<HTMLElement>
) {
  const renderedComponentRef = useRef<ng.ComponentRef<any>>();
  const [renderedElement, setRenderedElement] = useState<HTMLElement | null>(null);

  const setInputs = (componentRef: ng.ComponentRef<any>, inputs: Record<string, any>) => {
    for (const [key, value] of Object.entries(inputs || {})) {
      componentRef.instance[key] = value;
    }
    renderedComponentRef.current = componentRef;
    componentRef.changeDetectorRef.detectChanges();
    // TODO: for more compat see @angular/elements
    // https://github.com/angular/angular/blob/4332897baa2226ef246ee054fdd5254e3c129109/packages/elements/src/component-factory-strategy.ts#L200
  };

  const hasChildren = !!children;
  const ngContentContainerEl = useMemo<HTMLDivElement | null>(() => {
    if (hasChildren) return document.createElement('div');
    return null;
  }, [hasChildren]);

  /** This effect makes sure event listeners like 'click' are registered when the element is rendered */
  useEffect(() => {
    if (!events) return;
    if (!renderedElement) return;

    const localEvents = events;
    const localEl = renderedElement;
    for (const event in localEvents) {
      localEl.addEventListener(event, localEvents[event]);
    }
    return () => {
      for (const event in localEvents) {
        localEl.removeEventListener(event, localEvents[event]);
      }
    };
  }, [renderedElement, events]);

  const elRef = useCallback<(node: HTMLElement) => void>(
    async (node) => {
      if (node === null) return;
      setRenderedElement(node);
      if (forwardedRef) {
        typeof forwardedRef === 'function' ? forwardedRef(node) : (forwardedRef.current = node);
      }
      const projectableNodes = ngContentContainerEl ? [[ngContentContainerEl]] : [];
      const componentFactory = ngModuleRef.componentFactoryResolver.resolveComponentFactory(ngComponent);
      const componentRef = componentFactory.create(ngModuleRef.injector, projectableNodes, node);
      if (inputs) setInputs(componentRef, inputs);
    },
    // inputs doesn't need to be a dep, this is already handled in the next useEffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ngComponent, ngModuleRef]
  );

  useEffect(() => {
    if (renderedComponentRef.current && inputs) setInputs(renderedComponentRef.current, inputs);
  }, [inputs]);

  useEffect(() => {
    if (!renderedComponentRef.current) return;
    return () => {
      renderedComponentRef.current!.destroy();
    };
  }, []);

  let componentName = ngComponentName;
  if (!componentName) {
    componentName = ngComponent.ɵcmp?.selectors?.[0]?.[0];
    if (!componentName) {
      console.error(`Couldn't get component name from component`, ngComponent.ɵcmp);
      throw new Error(`Couldn't get component name from component`);
    } else if (!componentName.match(/^[a-z0-9-]+$/)) {
      console.error(`Couldn't use component selector as component name`, componentName);
      throw new Error(`Couldn't use component selector as component name`);
    }
  }

  return (
    <>
      {React.createElement(componentName, { ref: elRef })}
      {ngContentContainerEl && ReactDOM.createPortal(<>{children}</>, ngContentContainerEl)}
    </>
  );
}

export default React.forwardRef(AngularWrapperWithModule);
