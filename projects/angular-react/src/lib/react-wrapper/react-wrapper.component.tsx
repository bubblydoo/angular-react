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
import * as ReactDOM from "react-dom";
import { AngularModuleContext } from "../angular-module-context/angular-module-context";
import { AngularReactService } from "../angular-react.service";

import { InjectorContext } from "../injector-context/injector-context";

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

  constructor(
    private injector: Injector,
    private ngModuleRef: NgModuleRef<any>,
    private angularReactService: AngularReactService
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.render();
  }

  ngOnChanges() {
    if (this.containerRef) this.render();
  }

  ngOnDestroy() {
    if (this.containerRef)
      ReactDOM.unmountComponentAtNode(this.containerRef.nativeElement);
  }

  private render() {
    if (!this.component)
      throw new Error("react-wrapper needs a component but none was passed");

    if (!this.containerRef) return;

    let WrappedComponent = () => {
      if (!this.component) return <></>;
      return <this.component {...this.props} />;
    };

    for (const Wrapper of this.angularReactService.wrappers) {
      WrappedComponent = () => (
        <Wrapper>
          <WrappedComponent />
        </Wrapper>
      );
    }

    ReactDOM.render(
      <AngularModuleContext.Provider value={this.ngModuleRef}>
        <InjectorContext.Provider value={this.injector}>
          <WrappedComponent />
        </InjectorContext.Provider>
      </AngularModuleContext.Provider>,
      this.containerRef.nativeElement
    );
  }
}
