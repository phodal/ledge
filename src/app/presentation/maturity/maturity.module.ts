import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaturityComponent } from './maturity.component';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: ':name',
    component: MaturityComponent,
  },
  { path: '', pathMatch: 'full', redirectTo: 'devops' },
];

@NgModule({
  declarations: [MaturityComponent],
  imports: [
    CommonModule,
    CustomMaterialModule,
    SharedModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      isolate: false,
    }),
  ],
})
export class MaturityModule {}
