import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgModuleRef,
  OnChanges,
  OnDestroy,
} from "@angular/core";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { AngularModuleContext } from "../angular-module-context/angular-module-context";
import { AngularReactService } from "../angular-react.service";
import { NestWrappers } from "../nest-wrappers/nest-wrappers";

@Component({
  selector: "react-wrapper",
  template: "",
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

    const wrappers = this.angularReactService.getWrappers();

    this.reactDomRoot.render(
      <AngularModuleContext.Provider value={this.ngModuleRef}>
        <NestWrappers wrappers={wrappers}>
          <this.component {...this.props} />
        </NestWrappers>
      </AngularModuleContext.Provider>
    );
  }
}
