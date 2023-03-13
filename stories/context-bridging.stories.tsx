import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import { Meta, moduleMetadata } from "@storybook/angular";
import React, { useState } from "react";
import {
  AngularWrapper,
  AngularReactModule,
  ReactWrapperComponent,
  useInjected,
  AngularReactService,
} from "../projects/angular-react/src/public-api";
import { NumberContext, NumberDisplay } from "./common/number";

@Component({
  selector: "inner-angular",
  template: `<div style="border: 1px solid; padding: 5px; margin: 5px">
    this is inner Angular
    <!-- <button (click)="wrapper.render()">call root.render() again</button> -->
    <react-wrapper *ngIf="show" [component]="Number" #wrapper></react-wrapper>
  </div>`,
})
class AngularNumberComponent {
  Number = NumberDisplay;
  show = true;
  @ViewChild('wrapper') wrapper!: ReactWrapperComponent;
}

function App() {
  const [number, setNumber] = useState(42);
  const angularReact = useInjected(AngularReactService);
  return (
    <div style={{ border: "1px solid", padding: "5px", margin: "5px" }}>
      <NumberContext.Provider value={number}>
        <div>this is React</div>
        <button onClick={() => setNumber((n) => n + 1)}>increment</button>
        <NumberDisplay />
        <AngularWrapper component={AngularNumberComponent} />
      </NumberContext.Provider>
    </div>
  );
}

@Component({
  template: `<react-wrapper [component]="App"></react-wrapper>`,
})
class OuterAngularComponent {
  App = App;
}

export default {
  title: "Basics/Context Bridging",
  component: OuterAngularComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, AngularReactModule],
      declarations: [OuterAngularComponent, AngularNumberComponent],
      providers: [ChangeDetectorRef, { provide: APP_BASE_HREF, useValue: "/" }],
    }),
  ],
} as Meta;

export const Showcase = () => ({
  props: {},
});
