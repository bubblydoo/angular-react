import { APP_BASE_HREF, CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
} from "@angular/core";
import { Meta, moduleMetadata } from "@storybook/angular";
import React, { useState } from "react";
import {
  AngularReactModule,
  AngularWrapper,
  InjectableReactContextToken,
  InjectableReactContext,
} from "../projects/angular-react/src/public-api";
import { NumberContext, NumberDisplay } from "./common/number";

@Component({
  selector: "inner",
  template: `
    <div style="border: 1px solid; padding: 5px; margin: 5px">
      this is Angular
      number: {{ (contexts.read(NumberContext) | async) ?? 'no number' }}
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class InnerComponent {
  NumberContext = NumberContext;

  constructor(@Inject(InjectableReactContextToken) public contexts: InjectableReactContext) {}
}

function App() {
  const [number, setNumber] = useState(42);
  return (
    <NumberContext.Provider value={number}>
      <button onClick={() => setNumber(number + 1)}>increment</button>
      <NumberDisplay />
      <AngularWrapper component={InnerComponent} />
    </NumberContext.Provider>
  );
}

@Component({
  selector: "outer",
  template: `<react-wrapper [component]="App"></react-wrapper>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OuterComponent {
  App = App;

  @Input() message!: string;
}

export default {
  title: "Basics/Injected Contexts",
  component: OuterComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, AngularReactModule],
      declarations: [OuterComponent, InnerComponent],
      providers: [ChangeDetectorRef, { provide: APP_BASE_HREF, useValue: "/" }],
    }),
  ],
} as Meta;

export const Showcase = () => ({
  props: {
    message: "Hello world!",
  },
});
