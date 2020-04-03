import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { LedgeHelperComponent } from './ledge-helper.component';

@NgModule({
  declarations: [LedgeHelperComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: LedgeHelperComponent }]),
  ],
})
export class LedgeHelperModule {}
