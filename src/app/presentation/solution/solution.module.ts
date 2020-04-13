import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SolutionRoutingModule } from './solution-routing.module';
import { CustomMaterialModule } from 'src/app/shared/custom-material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SolutionComponent } from './solution.component';

@NgModule({
  declarations: [SolutionComponent],
  imports: [
    CommonModule,
    SolutionRoutingModule,
    CustomMaterialModule,
    SharedModule,
  ],
})
export class SolutionModule {}
