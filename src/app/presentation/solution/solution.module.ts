import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SolutionRoutingModule } from './solution-routing.module';
import { CustomMaterialModule } from 'src/app/shared/custom-material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SolutionComponent } from './solution.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [SolutionComponent],
  imports: [
    CommonModule,
    SolutionRoutingModule,
    CustomMaterialModule,
    SharedModule,
    TranslateModule.forChild({
      isolate: false,
    }),
  ],
})
export class SolutionModule {}
