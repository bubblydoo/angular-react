import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component } from "@angular/core";
import { Meta, moduleMetadata } from "@storybook/angular";
import React, { forwardRef, Ref, RefObject, RefCallback } from "react";
import {
  AngularReactModule,
} from "../projects/angular-react/src/public-api";

const Message = forwardRef(
  (props: { message: string }, ref: Ref<HTMLDivElement>) => {
    return <div ref={ref}>{props.message}</div>;
  }
);

@Component({
  template: `<react-wrapper
    [component]="Message"
    [props]="{ ref, message }"
  ></react-wrapper>`,
})
class MessageComponent {
  Message = Message;

  message = "hi!";

  ref(div: HTMLElement) {
    div.innerHTML = 'hi manually!';
  }
}

export default {
  title: "Basics/Using Ref",
  component: MessageComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, AngularReactModule],
      declarations: [MessageComponent],
      providers: [ChangeDetectorRef, { provide: APP_BASE_HREF, useValue: "/" }],
    }),
  ],
} as Meta;

export const Showcase = () => ({
  props: {},
});
