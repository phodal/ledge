import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ThinkTankComponent } from './think-tank.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [ThinkTankComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    CustomMaterialModule,
    SharedModule,
    RouterModule.forChild([
      {
        path: ':tank',
        component: ThinkTankComponent,
      },
      { path: '', pathMatch: 'full', redirectTo: 'qa' },
    ]),
  ],
})
export class ThinkTankModule {}
