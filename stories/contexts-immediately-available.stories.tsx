import { CommonModule, APP_BASE_HREF } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  INJECTOR,
  Inject,
  Injector,
  Input,
  TemplateRef,
} from "@angular/core";
import { moduleMetadata, Meta } from "@storybook/angular";
import React, { createContext, forwardRef, useContext, useMemo } from "react";
import {
  AngularReactModule,
  AngularWrapper,
  useFromAngularTemplateRefFn,
  useToAngularTemplateRef,
} from "../projects/angular-react/src/public-api";

const SomeContext = createContext<string | null>(null);

function useThrowIfNoContext() {
  const value = useContext(SomeContext);
  if (value === null) {
    throw new Error("No context value");
  }
  return value;
}

const Button = ({ children }: { children: any }) => {
  useThrowIfNoContext();
  return <button>{children}</button>;
};

@Component({
  selector: "creator",
  template: `
    <ng-container
      [ngTemplateOutlet]="overviewTmpl"
      [ngTemplateOutletContext]="{ confirmButtonTmpl: confirmButtonTmpl }"
      [ngTemplateOutletInjector]="injector"
    ></ng-container>
  `,
})
class CreatorComponent {
  @Input() overviewTmpl!: TemplateRef<{}>;
  @Input() confirmButtonTmpl!: TemplateRef<{}>;

  constructor(@Inject(INJECTOR) public injector: Injector) {}
}

const Creator = forwardRef<
  {},
  {
    overviewTmpl: (props: { confirmButtonTmpl: TemplateRef<{}> }) => any;
    confirmButtonTmpl: (props: {}) => any;
  }
>((props, ref) => {
  useThrowIfNoContext();
  const overviewTmpl = useToAngularTemplateRef(props.overviewTmpl);
  const confirmButtonTmpl = useToAngularTemplateRef(props.confirmButtonTmpl);

  const inputs = useMemo(
    () => ({ overviewTmpl, confirmButtonTmpl }),
    [overviewTmpl, confirmButtonTmpl]
  );

  return <AngularWrapper component={CreatorComponent} inputs={inputs} />;
});

const CreatorOverview = forwardRef<
  {},
  { confirmButtonTmpl: (props: {}) => any }
>((props, ref) => {
  useThrowIfNoContext();
  const confirmButtonTmpl = useToAngularTemplateRef(props.confirmButtonTmpl);

  const inputs = useMemo(
    () => ({
      confirmButtonTmpl,
    }),
    [confirmButtonTmpl]
  );

  return (
    <AngularWrapper component={CreatorOverviewComponent} inputs={inputs} />
  );
});

@Component({
  selector: "creator-overview",
  template: `
    <ng-container
      [ngTemplateOutlet]="confirmButtonTmpl"
      [ngTemplateOutletInjector]="injector"
    ></ng-container>
  `,
})
class CreatorOverviewComponent {
  @Input() confirmButtonTmpl!: TemplateRef<{}>;

  constructor(@Inject(INJECTOR) public injector: Injector) {}
}

const OverviewTmpl = (props: { confirmButtonTmpl: TemplateRef<{}> }) => {
  useThrowIfNoContext();
  const fromAngularTemplateRef = useFromAngularTemplateRefFn();
  return (
    <CreatorOverview
      confirmButtonTmpl={(tmplProps) =>
        fromAngularTemplateRef(props.confirmButtonTmpl, tmplProps)
      }
    ></CreatorOverview>
  );
};

const ConfirmButtonTmpl = (props: {}) => {
  useThrowIfNoContext();
  return <Button>submit</Button>;
};

function AppInner() {
  return (
    <Creator
      overviewTmpl={OverviewTmpl}
      confirmButtonTmpl={ConfirmButtonTmpl}
    />
  );
}

function App() {
  return (
    <SomeContext.Provider value="actual value">
      <AppInner />
    </SomeContext.Provider>
  );
}

@Component({
  selector: "app",
  template: `<react-wrapper [component]="App"></react-wrapper>`,
})
class AppComponent {
  App = App;
}

export default {
  title: "Tests/Context immediately available",
  component: AppComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, AngularReactModule],
      declarations: [AppComponent, CreatorComponent, CreatorOverviewComponent],
      providers: [ChangeDetectorRef, { provide: APP_BASE_HREF, useValue: "/" }],
    }),
  ],
} as Meta;

export const Showcase = () => ({
  props: {},
});
