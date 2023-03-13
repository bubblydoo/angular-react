import { APP_BASE_HREF, CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  TemplateRef,
} from "@angular/core";
import { Meta, moduleMetadata } from "@storybook/angular";
import React, { useState } from "react";
import {
  AngularReactModule,
  useFromAngularTemplateRef,
  AngularWrapper,
} from "../projects/angular-react/src/public-api";
import { NumberContext, NumberDisplay } from "./common/number";

@Component({
  selector: "inner2",
  template: `
    <div style="border: 1px solid; padding: 5px; margin: 5px">
      this is Angular
      <react-wrapper [component]="NumberDisplay"></react-wrapper>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Inner2Component {
  NumberDisplay = NumberDisplay;
}

function TemplateOutlet(props: { tmpl: TemplateRef<{}> }) {
  const Template = useFromAngularTemplateRef(props.tmpl);

  return <Template />;
}

function TemplateOutletAndDisplay(props: { tmpl: TemplateRef<{}> }) {
  const Template = useFromAngularTemplateRef(props.tmpl);

  return (
    <>
      <Template />
      <TemplateOutlet tmpl={props.tmpl} />
      <NumberContext.Consumer>
        {(number) => (
          <div style={{ border: "1px solid", padding: "5px", margin: "5px" }}>
            <NumberContext.Provider value={number! + 1}>
              inside this context it's number + 1 = {number! + 1},
              <Template />
              <TemplateOutlet tmpl={props.tmpl} />
              <AngularWrapper component={Inner2Component} />
            </NumberContext.Provider>
          </div>
        )}
      </NumberContext.Consumer>
    </>
  );
}

@Component({
  selector: "inner",
  template: `
    <div style="border: 1px solid; padding: 5px; margin: 5px">
      this is Angular
      <ng-template #tmpl>
        <div style="border: 1px solid; padding: 5px; margin: 5px">
          this is an Angular template
          <react-wrapper [component]="NumberDisplay"></react-wrapper>
        </div>
      </ng-template>
      <react-wrapper
        [component]="TemplateOutletAndDisplay"
        [props]="{ tmpl }"
      ></react-wrapper>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class InnerComponent {
  NumberDisplay = NumberDisplay;
  TemplateOutletAndDisplay = TemplateOutletAndDisplay;

  @Input() message!: string;

  constructor(private cd: ChangeDetectorRef) {}
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
  title: "Templates/From Angular TemplateRef with Context Bridging",
  component: OuterComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, AngularReactModule],
      declarations: [OuterComponent, InnerComponent, Inner2Component],
      providers: [ChangeDetectorRef, { provide: APP_BASE_HREF, useValue: "/" }],
    }),
  ],
} as Meta;

export const Showcase = () => ({
  props: {
    message: "Hello world!",
  },
});
