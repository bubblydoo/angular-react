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
import { ReactContextToken } from "../injectable-react-context/react-context-token";
import { AngularTemplateOutlet } from "../templates/angular-template-outlet";
import { InjectableReactContext } from "../injectable-react-context/use-injectable-react-context";
import { InTreeCreateRootToken } from "../use-in-tree-create-root/in-tree-create-root-token";
import { useInTreeCreateRoot } from "../use-in-tree-create-root/use-in-tree-create-root";

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
  private isTopLevelReact = !this.inTreeCreateRoot;
  private reactCreateRoot: typeof ReactDOM.createRoot =
    this.inTreeCreateRoot || ReactDOM.createRoot;
  private reactDomRoot: ReactDOM.Root | null = null;

  constructor(
    private ngModuleRef: NgModuleRef<any>,
    private ngInjector: Injector,
    private angularReactService: AngularReactService,
    private elementRef: ElementRef<HTMLElement>,
    @Optional()
    @Inject(InTreeCreateRootToken)
    private inTreeCreateRoot?: typeof ReactDOM.createRoot
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
