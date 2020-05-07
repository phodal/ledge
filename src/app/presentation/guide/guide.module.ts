import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { CustomMaterialModule } from '../../shared/custom-material.module';
import { SharedModule } from '../../shared/shared.module';
import { GuideComponent } from './guide.component';

const routes: Routes = [
  {
    path: '',
    component: GuideComponent,
  },
];

@NgModule({
  declarations: [GuideComponent],
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
export class GuideModule {}
