/*
 * Public API Surface of angular-react
 */

export * from './lib/angular-react.service';
export * from './lib/angular-react.module';
export * from './lib/react-wrapper/react-wrapper.component';
export * from './lib/injector-context/injector-context';
export * from './lib/angular-module-context/angular-module-context';
import AngularWrapper from './lib/angular-wrapper/angular-wrapper';
import AngularWrapperWithModule from './lib/angular-wrapper-with-module/angular-wrapper-with-module';
import useInjected from './lib/use-injected/use-injected';
import useObservable from './lib/use-observable/use-observable';

export { AngularWrapper, AngularWrapperWithModule, useInjected, useObservable };
