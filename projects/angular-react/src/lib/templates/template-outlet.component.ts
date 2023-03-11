import { ChangeDetectionStrategy, Component, Input, TemplateRef } from "@angular/core";

@Component({
  selector: 'template-outlet',
  template: `
    <ng-container [ngTemplateOutlet]="tmpl" [ngTemplateOutletContext]="tmplContext"></ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateOutletComponent {
  @Input() public tmpl!: TemplateRef<any>;
  @Input() public tmplContext!: Record<string, any>;
}
