import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { ChecklistsComponent } from './checklists.component';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { ChecklistsRoutingModule } from './checklists-routing.module';
import { LedgeRenderModule } from '@ledge-framework/render';

@NgModule({
  declarations: [ChecklistsComponent],
  imports: [
    CommonModule,
    SharedModule,
    CustomMaterialModule,
    LedgeRenderModule,
    ChecklistsRoutingModule,
  ],
})
export class ChecklistsModule {}
