import { AfterViewInit, ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'react-to-template-ref',
  template: `
    <ng-template #tmpl let-props="props">
      <react-wrapper *ngIf="component" [component]="component" [props]="props"></react-wrapper>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReactToTemplateRefComponent<C> implements AfterViewInit {
  @Input() public component!: any;
  @ViewChild('tmpl') public tmpl!: TemplateRef<{ props: C }> | null;
  private resolveTemplateRef!: (templateRef: TemplateRef<{ props: C }>) => any;
  templateRefPromise = new Promise<TemplateRef<{ props: C }>>((resolve) => {
    this.resolveTemplateRef = resolve;
  });

  ngAfterViewInit(): void {
    this.resolveTemplateRef(this.tmpl!);
  }
}
