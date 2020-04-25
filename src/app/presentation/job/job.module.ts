import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { JobComponent } from './job.component';
import { FormsModule } from '@angular/forms';
import { LedgeRenderModule } from '@ledge-framework/render';

import { SharedModule } from '../../shared/shared.module';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { CreateJobDialogComponent } from './create-job-dialog/create-job-dialog.component';

@NgModule({
  declarations: [JobComponent, CreateJobDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    LedgeRenderModule,
    CustomMaterialModule,
    RouterModule.forChild([{ path: '', component: JobComponent }]),
  ],
})
export class JobModule {}
