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

  /** Whether this component is where the React root should be created (true if using React-in-Angular) */
  private isTopLevelReact = !this.passedReactContext;
  private reactCreateRoot: typeof ReactDOM.createRoot =
    this.passedReactContext?.createRoot || ReactDOM.createRoot;
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
    if (!this.elementRef) throw new Error("No element ref");
    this.reactDomRoot = this.reactCreateRoot(this.elementRef.nativeElement);
    this.render();
  }

  ngOnChanges() {
    if (this.elementRef) this.render();
  }

  ngOnDestroy() {
    // wait one microtask to make sure that the react component is done rendering (logs errors otherwise)
    Promise.resolve().then(() => this.reactDomRoot?.unmount());
  }

  private render() {
    if (!this.component)
      throw new Error("react-wrapper needs a component but none was passed");

    if (!this.reactDomRoot) return;

    let wrappers = this.angularReactService.wrappers;

    const children = this.props.children ? undefined : (
      <AngularTemplateOutlet tmpl={this.childrenTmpl} />
    );

    const wrapped = nestWrappers(
      wrappers,
      <this.component {...this.props}>{children}</this.component>
    );

    const toBeRendered = this.isTopLevelReact ? (
      <RootAngularContextProvider
        moduleRef={this.ngModuleRef}
        injector={this.ngInjector}
      >
        {wrapped}
      </RootAngularContextProvider>
    ) : (
      wrapped
    );

    this.reactDomRoot.render(toBeRendered);
  }
}
