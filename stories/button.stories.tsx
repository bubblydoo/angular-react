import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component } from "@angular/core";
import { Meta, moduleMetadata } from "@storybook/angular";
import React from "react";
import { AngularReactModule } from "../projects/angular-react/src/public-api";

function Button(props: { children: React.ReactNode }) {
  return <button>{props.children}</button>;
}

@Component({
  template: `
    <react-wrapper [component]="Button" [props]="{ children: 'Children passed in props' }">
    </react-wrapper>
    <react-wrapper [component]="Button">
      Children passed in template
    </react-wrapper>
  `,
})
class AngularComponent {
  Button = Button;
}

export default {
  title: "Tests/Button",
  component: AngularComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, AngularReactModule],
      declarations: [AngularComponent],
      providers: [ChangeDetectorRef, { provide: APP_BASE_HREF, useValue: "/" }],
    }),
  ],
} as Meta;

export const Showcase = () => ({
  props: {},
});
