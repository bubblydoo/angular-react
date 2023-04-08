import { APP_BASE_HREF, CommonModule } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  Inject,
  InjectFlags,
  Injector,
  Input,
  Optional,
  TemplateRef,
} from "@angular/core";
import { Meta, moduleMetadata } from "@storybook/angular";
import React, { useMemo } from "react";
import {
  AngularWrapper,
  AngularReactModule,
  useToAngularTemplateRef,
  PassedReactContextToken,
  PassedReactContext,
  useInjected,
} from "../projects/angular-react/src/public-api";
import { NumberContext, NumberDisplay } from "./common/number";

@Component({
  selector: "thing",
  template: `
    <div>
      <p>Has passed context in angular: {{ !!passedReactContext }}</p>
      <div style="border: 1px solid; padding: 5px">
        <ng-container
          [ngTemplateOutlet]="tmpl"
          [ngTemplateOutletInjector]="injector"
        ></ng-container>
        <react-wrapper [component]="NumberDisplayWithDebug"></react-wrapper>
      </div>
    </div>
  `,
})
class ThingComponent {
  NumberDisplayWithDebug = NumberDisplayWithDebug;

  @Input() tmpl!: TemplateRef<{ message: string }>;

  constructor(
    public injector: Injector,
    @Optional()
    @Inject(PassedReactContextToken)
    public passedReactContext: PassedReactContext,
  ) {}
}

const NumberDisplayWithDebug = () => {
  const passedReactContext = useInjected(PassedReactContextToken, null, InjectFlags.Optional);

  return (
    <>
      {`Has passed context in react: ${!!passedReactContext}`}
      <NumberDisplay />
    </>
  );
};

function Parent(props: {}) {
  const [tmpl, tmplPortals] = useToAngularTemplateRef(NumberDisplayWithDebug);

  const inputs = useMemo(() => ({ tmpl }), [tmpl]);

  const [number, setNumber] = React.useState(0);

  return (
    <>
      <button onClick={() => setNumber(number + 1)}>Increment</button>
      <NumberContext.Provider value={number}>
        <AngularWrapper component={ThingComponent} inputs={inputs} />
      </NumberContext.Provider>
      {tmplPortals}
    </>
  );
}

@Component({
  template: `
    <div style="border: 1px solid; padding: 5px">
      <react-wrapper [component]="Parent"></react-wrapper>
    </div>
  `,
})
class OuterAngularComponent {
  Parent = Parent;
}

export default {
  title: "Tests/Context in templates",
  component: OuterAngularComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, AngularReactModule],
      declarations: [OuterAngularComponent, ThingComponent],
      providers: [ChangeDetectorRef, { provide: APP_BASE_HREF, useValue: "/" }],
    }),
  ],
} as Meta;

export const Showcase = () => ({
  props: {},
});
