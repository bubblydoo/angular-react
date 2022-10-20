import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component } from "@angular/core";
import { Meta, moduleMetadata } from "@storybook/angular";
import React from "react";
import {
  AngularWrapper,
  AngularReactModule,
} from "../projects/angular-react/src/public-api";

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `<div style="border: 1px solid; padding: 5px">
    this is inner Angular
  </div>`,
})
class InnerAngularComponent {}

@Component({
  standalone: true,
  imports: [CommonModule, AngularReactModule],
  template: `
    <div style="border: 1px solid; padding: 5px">
      <div>this is outer Angular</div>
      <react-wrapper [component]="ReactComponent"></react-wrapper>
    </div>
  `,
})
class OuterAngularComponent {
  ReactComponent = ReactComponent;
}

function ReactComponent() {
  return (
    <div style={{ border: "1px solid", padding: "5px" }}>
      <div>this is React</div>
      <AngularWrapper component={InnerAngularComponent} />
    </div>
  );
}

export default {
  title: "Standalone",
  component: OuterAngularComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, AngularReactModule],
      providers: [ChangeDetectorRef, { provide: APP_BASE_HREF, useValue: "/" }],
    }),
  ],
} as Meta;

export const Showcase = () => ({
  props: {},
});
