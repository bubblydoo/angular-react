import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgModuleRef,
  OnChanges,
  OnDestroy,
} from "@angular/core";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { delay } from "rxjs/operators";
import { AngularModuleContextProvider } from "../angular-module-context/angular-module-context";
import { AngularReactService } from "../angular-react.service";
import { nestWrappers } from "../nest-wrappers/nest-wrappers";

@Component({
  selector: "react-wrapper",
  template: "",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReactWrapperComponent
  implements OnChanges, OnDestroy, AfterViewInit
{
  @Input()
  props: any = {};
  @Input()
  component: React.ElementType | null = null;
  @Input()
  ignoreWrappers = false;

  private viewInited = false;
  // this subscription is needed for the context bridge, see
  // https://github.com/pmndrs/its-fine/issues/26#issuecomment-1466107714
  private renderSubscription = this.angularReactService.render$.subscribe(
    () => !this.ignoreWrappers && this.viewInited && this.render()
  );

  private reactDomRoot: ReactDOM.Root | null = null;

  constructor(
    private ngModuleRef: NgModuleRef<any>,
    private angularReactService: AngularReactService,
    private elementRef: ElementRef<HTMLElement>
  ) {}

  ngAfterViewInit() {
    this.viewInited = true;
    if (!this.elementRef) throw new Error("No element ref");
    this.reactDomRoot = ReactDOM.createRoot(this.elementRef.nativeElement);
    this.render();
  }

  ngOnChanges() {
    if (this.elementRef) this.render();
  }

  ngOnDestroy() {
    this.reactDomRoot?.unmount();
    this.renderSubscription.unsubscribe();
  }

  private render() {
    if (!this.component)
      throw new Error("react-wrapper needs a component but none was passed");

    if (!this.reactDomRoot) return;

    const wrappers = this.ignoreWrappers
      ? []
      : this.angularReactService.wrappers;

    this.reactDomRoot.render(
      <AngularModuleContextProvider moduleRef={this.ngModuleRef}>
        {nestWrappers(wrappers, <this.component {...this.props} />)}
      </AngularModuleContextProvider>
    );
  }
}
