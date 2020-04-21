import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobComponent } from './job.component';
import { FormsModule } from '@angular/forms';
import { LedgeRenderModule } from '@ledge-framework/render';

import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [JobComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    LedgeRenderModule,
    RouterModule.forChild([{ path: '', component: JobComponent }]),
  ],
})
export class JobModule {}
