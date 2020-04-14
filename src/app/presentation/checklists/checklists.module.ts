import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { ChecklistsComponent } from './checklists.component';
import { LedgeRenderModule } from '../../../../projects/ledge-render/src/lib/ledge-render.module';

@NgModule({
  declarations: [ChecklistsComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: ChecklistsComponent }]),
    LedgeRenderModule,
  ],
})
export class ChecklistsModule {}
