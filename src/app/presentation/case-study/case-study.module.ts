import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CaseStudyRoutingModule } from './case-study-routing.module';
import { CaseStudyComponent } from './case-study.component';
import { CustomMaterialModule } from 'src/app/shared/custom-material.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [CaseStudyComponent],
  imports: [
    CommonModule,
    CaseStudyRoutingModule,
    CustomMaterialModule,
    SharedModule,
  ],
})
export class CaseStudyModule {}
