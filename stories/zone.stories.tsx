import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, EventEmitter, NgZone, Output } from "@angular/core";
import { Meta, moduleMetadata } from "@storybook/angular";
import React, { useCallback } from "react";
import {
  AngularWrapper,
  AngularReactModule,
  useInjected,
} from "../projects/angular-react/src/public-api";

@Component({
  selector: "inner-angular",
  template: `<button>
    Click here
  </button>
  <button (click)="customEvent.emit()">
    Custom event here
  </button>`,
})
class InnerAngularComponent {
  @Output() customEvent = new EventEmitter<void>();
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
  const zone = useInjected(NgZone)
  const clickHandler = useCallback(() => {
    alert(`Received click! Zone name: ${Zone.current?.name}`);
  }, [zone]);
  const customEventHandler = useCallback(() => {
    alert(`Received custom event! Zone name: ${Zone.current?.name}`);
  }, [zone]);

  return (
    <div style={{ border: "1px solid", padding: "5px" }}>
      <AngularWrapper component={InnerAngularComponent} events={{ click: clickHandler }} outputs={{ customEvent: customEventHandler }} />
    </div>
  );
}

export default {
  title: "Research/NgZone Handling",
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
