import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component } from "@angular/core";
import { Meta, moduleMetadata } from "@storybook/angular";
import { useContextBridge } from "its-fine";
import React, { useCallback, useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { Subject } from "rxjs";
import { AngularReactModule } from "../projects/angular-react/src/public-api";
import { NumberContext, NumberDisplay } from "./common/number";

const render$ = new Subject<void>();

(window as any).render$ = render$;

function Canvas({ Component }: { Component: any }) {
  const [el, setEl] = useState<HTMLDivElement>();
  const [root, setRoot] = useState<Root>();
  const ContextBridge = useContextBridge();

  render$.next();

  useEffect(() => {
    if (!el) return;
    const root = createRoot(el);
    setRoot(root);
    return () => root.unmount();
  }, [el]);

  const render = useCallback(
    () =>
      root?.render(
        <div style={{ border: "1px solid", padding: "5px", margin: "5px" }}>
          this is a new React root, bridging the context
          <ContextBridge>
            <Component />
          </ContextBridge>
        </div>
      ),
    [root, Component]
  );

  useEffect(() => {
    const subscription = render$.subscribe(render);
    return () => subscription.unsubscribe();
  }, [render, render$]);

  return <div ref={(el) => el && setEl(el)}></div>;
}

function App() {
  const [number, setNumber] = useState(42);
  return (
    <div style={{ border: "1px solid", padding: "5px", margin: "5px" }}>
      <NumberContext.Provider value={number}>
        <button onClick={() => setNumber((n) => n + 1)}>increment</button>
        <NumberDisplay />
        <Canvas Component={NumberDisplay}></Canvas>
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
  title: "Research/render$",
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
