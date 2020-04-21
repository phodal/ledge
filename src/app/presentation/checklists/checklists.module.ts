import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { ChecklistsComponent } from './checklists.component';
import { LedgeRenderModule } from '../../../../projects/ledge-render/src/lib/ledge-render.module';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { ChecklistsRoutingModule } from './checklists-routing.module';

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
