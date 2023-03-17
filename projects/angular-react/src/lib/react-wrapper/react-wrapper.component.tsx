import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  InjectFlags,
  Injector,
  Input,
  NgModuleRef,
  OnChanges,
  OnDestroy,
  Optional,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { RootAngularContextProvider } from "../angular-context/angular-context";
import { AngularReactService } from "../angular-react.service";
import { nestWrappers } from "../nest-wrappers/nest-wrappers";
import {
  PassedReactContextToken,
  PassedReactContext,
} from "../passed-react-context-token/passed-react-context-token";
import { AngularTemplateOutlet } from "../templates/angular-template-outlet";

@Component({
  selector: "react-wrapper",
  template: "<ng-template #children><ng-content></ng-content></ng-template>",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReactWrapperComponent
  implements OnChanges, OnDestroy, AfterViewInit
{
  @Input()
  props: any = {};
  @Input()
  component: React.ElementType | null = null;

  @ViewChild("children") childrenTmpl!: TemplateRef<any>;

  private viewInited = false;
  // this subscription is needed for the context bridge, see
  // https://github.com/pmndrs/its-fine/issues/26#issuecomment-1466107714
  private renderSubscription = this.passedReactContext?.render$.subscribe(
    () => this.viewInited && this.render()
  );

  private reactDomRoot: ReactDOM.Root | null = null;

  constructor(
    private ngModuleRef: NgModuleRef<any>,
    private ngInjector: Injector,
    private angularReactService: AngularReactService,
    private elementRef: ElementRef<HTMLElement>,
    @Optional()
    @Inject(PassedReactContextToken)
    private passedReactContext?: PassedReactContext
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
    // wait one microtask to make sure that the react component is done rendering (logs errors otherwise)
    Promise.resolve().then(() => this.reactDomRoot?.unmount());
    this.renderSubscription?.unsubscribe();
  }

  private render() {
    if (!this.component)
      throw new Error("react-wrapper needs a component but none was passed");

    if (!this.reactDomRoot) return;

    let wrappers = this.angularReactService.wrappers;

    if (this.passedReactContext) {
      wrappers = [...wrappers, this.passedReactContext.ContextBridge];
    }

    const children = this.props.children ? undefined : (
      <AngularTemplateOutlet tmpl={this.childrenTmpl} />
    );

    this.reactDomRoot.render(
      <RootAngularContextProvider
        moduleRef={this.ngModuleRef}
        injector={this.ngInjector}
      >
        {nestWrappers(
          wrappers,
          <this.component {...this.props}>{children}</this.component>
        )}
      </RootAngularContextProvider>
    );
  }
}
