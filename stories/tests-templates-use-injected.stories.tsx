import { APP_BASE_HREF, CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  InjectionToken,
  Input,
  TemplateRef,
} from "@angular/core";
import { Meta, moduleMetadata } from "@storybook/angular";
import React, { useState } from "react";
import {
  AngularReactModule,
  useFromAngularTemplateRef,
  AngularWrapper,
  useInjected,
  useToAngularTemplateRef,
  AngularTemplateOutlet,
} from "../projects/angular-react/src/public-api";
import { NumberContext, NumberDisplay } from "./common/number";

const Intl = new InjectionToken<Record<string, string>>("Intl");

function IntlNumberDisplay() {
  const intl = useInjected(Intl);

  return (
    <div>
      {intl["number"]}:
      <br />
      <NumberDisplay></NumberDisplay>
    </div>
  );
}

@Component({
  selector: "inner2",
  template: `
    <div style="border: 1px solid; padding: 5px; margin: 5px">
      this is Angular
      <react-wrapper [component]="IntlNumberDisplay"></react-wrapper>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Inner2Component {
  IntlNumberDisplay = IntlNumberDisplay;
}

function TemplateOutlet(props: { tmpl: TemplateRef<{}> }) {
  const Template = useFromAngularTemplateRef(props.tmpl);

  return <Template />;
}

function TemplateOutletAndDisplay(props: { tmpl: TemplateRef<{}> }) {
  const Template = useFromAngularTemplateRef(props.tmpl);
  const angularTemplate = useToAngularTemplateRef(IntlNumberDisplay);

  return (
    <>
      <Template />
      <TemplateOutlet tmpl={props.tmpl} />
      {angularTemplate && <AngularTemplateOutlet tmpl={angularTemplate} />}
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
          <react-wrapper [component]="IntlNumberDisplay"></react-wrapper>
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
  IntlNumberDisplay = IntlNumberDisplay;
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
  title: "Tests/useInjected with templates",
  component: OuterComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, AngularReactModule],
      declarations: [OuterComponent, InnerComponent, Inner2Component],
      providers: [
        ChangeDetectorRef,
        { provide: APP_BASE_HREF, useValue: "/" },
        { provide: Intl, useValue: { number: "numero" } },
      ],
    }),
  ],
} as Meta;

export const Showcase = () => ({
  props: {
    message: "Hello world!",
  },
});
