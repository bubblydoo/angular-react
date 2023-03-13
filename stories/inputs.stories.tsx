import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, Output } from "@angular/core";
import { Meta, moduleMetadata } from "@storybook/angular";
import React, { useCallback } from "react";
import {
  AngularWrapper,
  AngularReactModule,
  useInjected,
} from "../projects/angular-react/src/public-api";

@Component({
  selector: "inner-angular",
  template: `Input: {{ input1 }}`,
})
class InnerAngularComponent {
  @Input('i1') input1?: string;
}

@Component({
  template: `
    <react-wrapper [component]="ReactComponent"></react-wrapper>
  `,
})
class OuterAngularComponent {
  ReactComponent = ReactComponent;
}

function ReactComponent() {
  return (
    <div style={{ border: "1px solid", padding: "5px" }}>
      <AngularWrapper component={InnerAngularComponent} inputs={{ i1: 'abc' }} />
    </div>
  );
}

export default {
  title: "Basics/Inputs Handling",
  component: OuterAngularComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, AngularReactModule],
      declarations: [OuterAngularComponent, InnerAngularComponent],
      providers: [ChangeDetectorRef, { provide: APP_BASE_HREF, useValue: "/" }],
    }),
  ],
} as Meta;

export const Showcase = () => ({
  props: {},
});
