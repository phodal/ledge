import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PartnersComponent } from './partners.component';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [PartnersComponent],
  imports: [
    CommonModule,
    CustomMaterialModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: PartnersComponent }]),
  ],
})
export class PartnersModule {}
