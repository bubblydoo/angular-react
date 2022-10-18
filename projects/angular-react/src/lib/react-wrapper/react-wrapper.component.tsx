import {
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  Input,
  NgModuleRef,
  OnChanges,
  OnDestroy,
} from "@angular/core";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { AngularModuleContext } from "../angular-module-context/angular-module-context";
import { AngularReactService } from "../angular-react.service";

import { InjectorContext } from "../injector-context/injector-context";
import { nestWrappers } from "../util/nest-wrappers";

@Component({
  selector: "react-wrapper",
  template: '',
})
export class ReactWrapperComponent
  implements OnChanges, OnDestroy, AfterViewInit
{
  @Input()
  props: any = {};
  @Input()
  component: React.ElementType | null = null;

  private reactDomRoot: ReactDOM.Root | null = null;

  constructor(
    private injector: Injector,
    private ngModuleRef: NgModuleRef<any>,
    private angularReactService: AngularReactService,
    private elementRef: ElementRef<HTMLElement>
  ) {}

  ngAfterViewInit() {
    if (!this.elementRef) throw new Error("No element ref");
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);
    this.render();
  }

  ngOnChanges() {
    if (this.elementRef) this.render();
  }

  ngOnDestroy() {
    this.reactDomRoot?.unmount();
  }

  private render() {
    if (!this.component)
      throw new Error("react-wrapper needs a component but none was passed");

    if (!this.reactDomRoot) return;

    // flatten the wrappers into one component
    const NestedWrappers = this.angularReactService.wrappers.length
      ? this.angularReactService.wrappers.reduce(nestWrappers)
      : (props: any) => props.children;

    this.reactDomRoot.render(
      <AngularModuleContext.Provider value={this.ngModuleRef}>
        <InjectorContext.Provider value={this.injector}>
          <NestedWrappers>
            <this.component {...this.props} />
          </NestedWrappers>
        </InjectorContext.Provider>
      </AngularModuleContext.Provider>
    );
  }
}
