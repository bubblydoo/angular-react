import { APP_BASE_HREF, CommonModule } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  Input,
  TemplateRef,
} from "@angular/core";
import { Meta, moduleMetadata } from "@storybook/angular";
import React, { useMemo } from "react";
import {
  AngularReactModule,
  useFromAngularTemplateRef,
} from "../projects/angular-react/src/public-api";

function Message(props: {
  message: string;
  tmpl: TemplateRef<{ message: string }>;
}) {
  const Template = useFromAngularTemplateRef(props.tmpl);

  return <Template message={props.message.toUpperCase()} />;
}

@Component({
  selector: "message",
  template: `
    <ng-template #tmpl let-message="message">{{ message }}</ng-template>
    <div>
      <react-wrapper
        [component]="Message"
        [props]="{ tmpl, message }"
      ></react-wrapper>
    </div>
  `,
})
class MessageComponent {
  Message = Message;

  @Input() message!: string;
}

export default {
  title: "Templates/From Angular TemplateRef",
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
  props: {
    message: "Hello world!",
  },
});
