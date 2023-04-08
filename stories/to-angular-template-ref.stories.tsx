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
  AngularWrapper,
  AngularReactModule,
  useToAngularTemplateRef,
} from "../projects/angular-react/src/public-api";

@Component({
  selector: "message",
  template: `
    <div>
      <ng-template
        [ngTemplateOutlet]="tmpl"
        [ngTemplateOutletContext]="{ message: message.toUpperCase() }"
      ></ng-template>
    </div>
  `,
})
class MessageComponent {
  @Input() tmpl!: TemplateRef<{ message: string }>;
  @Input() message!: string;
}

function Text(props: { message: string }) {
  return <>{props.message}</>;
}

function Message(props: { message: string }) {
  const tmpl = useToAngularTemplateRef(Text);

  const inputs = useMemo(
    () => ({
      message: props.message,
      tmpl,
    }),
    [props.message, tmpl]
  );

  return <AngularWrapper component={MessageComponent} inputs={inputs} />;
}

@Component({
  template: `
    <div style="border: 1px solid; padding: 5px">
      <react-wrapper
        [component]="Message"
        [props]="{ message: 'hello world!' }"
      ></react-wrapper>
    </div>
  `,
})
class OuterAngularComponent {
  Message = Message;
}

export default {
  title: "Templates/To Angular TemplateRef",
  component: OuterAngularComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, AngularReactModule],
      declarations: [OuterAngularComponent, MessageComponent],
      providers: [ChangeDetectorRef, { provide: APP_BASE_HREF, useValue: "/" }],
    }),
  ],
} as Meta;

export const Showcase = () => ({
  props: {},
});
