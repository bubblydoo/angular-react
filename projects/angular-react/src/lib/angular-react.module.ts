import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactToTemplateRefComponent, TemplateOutletComponent } from '../public-api';
import { ReactWrapperComponent } from './react-wrapper/react-wrapper.component';

@NgModule({
  declarations: [ReactWrapperComponent, ReactToTemplateRefComponent, TemplateOutletComponent],
  imports: [CommonModule],
  exports: [ReactWrapperComponent, ReactToTemplateRefComponent, TemplateOutletComponent],
})
export class AngularReactModule {}
