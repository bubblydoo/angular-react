import { type ComponentRef } from '@angular/core';
import React, { ForwardedRef, forwardRef, useContext } from 'react';
import { AngularInjectorContext, AngularModuleContext } from '../angular-context/angular-context';
import { AngularWrapperWithModule } from '../angular-wrapper-with-module/angular-wrapper-with-module';

function AngularWrapper(
  props: {
    name?: string;
    component: any;
    inputs?: Record<string, any>;
    events?: Record<string, (ev: Event) => any>;
    outputs?: Record<string, (value: any) => any>;
    children?: any;
  },
  forwardedRef: ForwardedRef<ComponentRef<any>>
) {
  const moduleRef = useContext(AngularModuleContext)!;
  const injector = useContext(AngularInjectorContext)!;

  return (
    <AngularWrapperWithModule
      name={props.name}
      component={props.component}
      moduleRef={moduleRef}
      injector={injector}
      inputs={props.inputs}
      events={props.events}
      outputs={props.outputs}
      ref={forwardedRef}
    >
      {props.children}
    </AngularWrapperWithModule>
  );
}

const AngularWrapperForwardRef = forwardRef(AngularWrapper);

export { AngularWrapperForwardRef as AngularWrapper };
