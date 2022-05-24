import {
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  Input,
  NgModuleRef,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { AngularModuleContext } from "../angular-module-context/angular-module-context";
import { AngularReactService } from "../angular-react.service";

import { InjectorContext } from "../injector-context/injector-context";
import { nestWrappers } from "../util/nest-wrappers";

@Component({
  selector: "react-wrapper",
  template: `<div #wrapper></div>`,
})
export class ReactWrapperComponent
  implements OnChanges, OnDestroy, AfterViewInit, OnInit
{
  @ViewChild("wrapper", { static: false }) containerRef: ElementRef | null =
    null;
  @Input()
  props: any = {};
  @Input()
  component: React.ElementType | null = null;

  private reactDomRoot: ReactDOM.Root | null = null;

  constructor(
    private injector: Injector,
    private ngModuleRef: NgModuleRef<any>,
    private angularReactService: AngularReactService
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    if (!this.containerRef) throw new Error("No container ref");
    this.reactDomRoot = ReactDOM.createRoot(this.containerRef.nativeElement);
    this.render();
  }

  ngOnChanges() {
    if (this.containerRef) this.render();
  }

  ngOnDestroy() {
    this.reactDomRoot?.unmount();
  }

  private render() {
    if (!this.component)
      throw new Error("react-wrapper needs a component but none was passed");

    if (!this.reactDomRoot) return;

    // flatten the wrappers into one component
    const NestedWrappers =
      this.angularReactService.wrappers.reduce(nestWrappers);

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
