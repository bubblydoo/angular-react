import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component } from "@angular/core";
import { Meta, moduleMetadata } from "@storybook/angular";
import React, { useState } from "react";
import { interval } from "rxjs";
import {
  AngularReactModule,
  AngularReactService,
} from "../projects/angular-react/src/public-api";

@Component({
  template: `
    <react-wrapper
      [component]="Time"
      [props]="{ time: time$ | async }"
    ></react-wrapper>
  `,
})
class AngularComponent {
  Time = Time;

  time$ = interval(100);

  constructor(private angularReact: AngularReactService) {
    this.angularReact.wrappers.push(({ children }) => (
      <div style={{ border: "1px solid", padding: 2 }}>1 {children}</div>
    ));
    this.angularReact.wrappers.push(({ children }) => (
      <div style={{ border: "1px solid", padding: 2 }}>2 {children}</div>
    ));
    this.angularReact.wrappers.push(({ children }) => (
      <div style={{ border: "1px solid", padding: 2 }}>3 {children}</div>
    ));
  }
}

function Time({ time }: { time: number }) {
  const [elementId] = useState(() => Math.round(Math.random() * 10000));

  return (
    <div style={{ border: "1px solid", padding: "5px" }}>
      <div>Time: {time}</div>
      <div>Should a be stable id: {elementId}</div>
    </div>
  );
}

export default {
  title: "Basics/Nested Wrappers",
  component: AngularComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, AngularReactModule],
      declarations: [AngularComponent],
      providers: [ChangeDetectorRef, { provide: APP_BASE_HREF, useValue: "/" }],
    }),
  ],
} as Meta;

export const Showcase = () => ({
  props: {},
});
