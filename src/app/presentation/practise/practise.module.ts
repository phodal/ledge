import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { PractiseComponent } from './practise.component';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [PractiseComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    CustomMaterialModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: ':practise',
        component: PractiseComponent,
      },
      { path: '', pathMatch: 'full', redirectTo: 'devops-practise' },
    ]),
  ],
})
export class PractiseModule {}
