import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactWrapperComponent } from './react-wrapper/react-wrapper.component';
import { ReactToTemplateRefComponent } from './templates/react-to-template-ref.component';
import { TemplateOutletComponent } from './templates/template-outlet.component';

@NgModule({
  declarations: [ReactWrapperComponent, ReactToTemplateRefComponent, TemplateOutletComponent],
  imports: [CommonModule],
  exports: [ReactWrapperComponent, ReactToTemplateRefComponent, TemplateOutletComponent],
})
export class AngularReactModule {}
