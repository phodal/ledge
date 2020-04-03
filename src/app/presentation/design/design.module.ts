import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DragulaModule } from 'ng2-dragula';

import { SharedModule } from '../../shared/shared.module';
import { DesignComponent } from './design.component';
import { PathComponent } from './path/path.component';
import { CustomMaterialModule } from '../../shared/custom-material.module';

@NgModule({
  declarations: [DesignComponent, PathComponent],
  imports: [
    CommonModule,
    SharedModule,
    CustomMaterialModule,
    DragulaModule.forRoot(),
    RouterModule.forChild([{ path: '', component: DesignComponent }]),
  ],
})
export class DesignModule {}
