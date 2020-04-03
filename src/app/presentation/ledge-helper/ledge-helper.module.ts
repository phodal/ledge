import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { LedgeHelperComponent } from './ledge-helper.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: LedgeHelperComponent }]),
  ],
})
export class LedgeHelperModule {}
