import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LedgeRenderModule } from '@ledge-framework/render';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { SharedModule } from '../../shared/shared.module';
import { CreateJobDialogComponent } from './create-job-dialog/create-job-dialog.component';
import { JobComponent } from './job.component';

@NgModule({
  declarations: [JobComponent, CreateJobDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    LedgeRenderModule,
    CustomMaterialModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: JobComponent }]),
  ],
})
export class JobModule {}
