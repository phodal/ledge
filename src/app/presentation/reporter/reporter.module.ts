import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';

import { CustomMaterialModule } from '../../shared/custom-material.module';
import { SharedModule } from '../../shared/shared.module';
import { ReporterComponent } from './reporter.component';

const routes: Routes = [
  {
    path: ':year',
    component: ReporterComponent,
  },
  { path: '', pathMatch: 'full', redirectTo: '2019' },
];

@NgModule({
  declarations: [ReporterComponent],
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
export class ReporterModule {}
