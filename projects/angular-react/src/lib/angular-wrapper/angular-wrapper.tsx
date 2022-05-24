import React, { ForwardedRef, useContext } from 'react';
import { AngularModuleContext } from '../angular-module-context/angular-module-context';
import AngularWrapperWithModule from '../angular-wrapper-with-module/angular-wrapper-with-module';

function AngularWrapper(
  props: {
    name?: string;
    component: any;
    inputs?: Record<string, any>;
    events?: Record<string, (ev: Event) => any>;
    children?: any;
  },
  forwardedRef: ForwardedRef<HTMLElement>
) {
  const moduleRef = useContext(AngularModuleContext);

  if (!moduleRef) return <></>;

  return (
    <AngularWrapperWithModule
      name={props.name}
      component={props.component}
      moduleRef={moduleRef}
      inputs={props.inputs}
      events={props.events}
      ref={forwardedRef}
    >
      {props.children}
    </AngularWrapperWithModule>
  );
}

export default React.forwardRef(AngularWrapper);
