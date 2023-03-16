import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component } from "@angular/core";
import { Meta, moduleMetadata } from "@storybook/angular";
import React from "react";
import { interval, timer } from "rxjs";
import {
  AngularWrapper,
  AngularReactModule,
} from "../projects/angular-react/src/public-api";


@Component({
  template: `
    <div style="border: 1px solid; padding: 5px">
      <div>this is outer Angular</div>
      <react-wrapper [component]="ReactComponent">
        hi: {{ time$ | async }}
      </react-wrapper>
    </div>
  `,
})
class OuterAngularComponent {
  ReactComponent = ReactComponent;

  time$ = interval(1000)
}

function ReactComponent({ children }: { children: any }) {
  return (
    <div style={{ border: "1px solid", padding: "5px" }}>
      <div>this is React</div>
      {children}
    </div>
  );
}

export default {
  title: "Tests/React Wrapper Children",
  component: OuterAngularComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, AngularReactModule],
      declarations: [OuterAngularComponent],
      providers: [ChangeDetectorRef, { provide: APP_BASE_HREF, useValue: "/" }],
    }),
  ],
} as Meta;

export const Showcase = () => ({
  props: {},
});
