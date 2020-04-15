import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CaseStudyRoutingModule } from './case-study-routing.module';
import { CaseStudyComponent } from './case-study.component';
import { CustomMaterialModule } from 'src/app/shared/custom-material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [CaseStudyComponent],
  imports: [
    CommonModule,
    CaseStudyRoutingModule,
    CustomMaterialModule,
    SharedModule,
    TranslateModule.forChild({
      isolate: false,
    }),
  ],
})
export class CaseStudyModule {}
