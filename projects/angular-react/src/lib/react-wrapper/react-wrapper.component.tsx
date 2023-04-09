import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
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
import { AngularTemplateOutlet } from "../templates/angular-template-outlet";
import { InTreeCreateRootToken } from "../use-in-tree-create-root/in-tree-create-root-token";
import { IsTopLevelReactToken } from "../templates/is-top-level-react-token";

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

  private reactDomRoot: ReactDOM.Root | null = null;

  constructor(
    private ngModuleRef: NgModuleRef<any>,
    private ngInjector: Injector,
    private angularReactService: AngularReactService,
    private elementRef: ElementRef<HTMLElement>,
    @Optional()
    @Inject(InTreeCreateRootToken)
    private inTreeCreateRoot?: typeof ReactDOM.createRoot,
    @Optional()
    @Inject(IsTopLevelReactToken)
    private isTopLevelReact?: boolean
  ) {
    this.isTopLevelReact = this.isTopLevelReact !== false;
    if (!this.isTopLevelReact && !this.inTreeCreateRoot) {
      console.error(
        "Rendering a react-wrapper without an inTreeCreateRoot function.\n" +
          'This is likely caused by <ng-container [ngTemplateOutlet]="..." /> without having a [ngTemplateOutletInjector].\n' +
          'Please add [ngTemplateOutletInjector]="injector" to any [ngTemplateOutlet] that takes a template from `useToAngularTemplateRef` ' +
          "(alongside `public injector: Injector` in your constructor).\n" +
          "If that is not possible, use `useToAngularTemplateRefBoundToContextAndPortals` instead of `useToAngularTemplateRef`. "
      );
    }
  }

  ngAfterViewInit() {
    if (!this.elementRef) throw new Error("No element ref");
    const reactCreateRoot = this.inTreeCreateRoot || ReactDOM.createRoot;
    this.reactDomRoot = reactCreateRoot(this.elementRef.nativeElement);
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

    const toBeRendered = (
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

    this.reactDomRoot.render(toBeRendered);
  }
}
