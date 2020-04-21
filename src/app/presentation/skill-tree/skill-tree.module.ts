import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LedgeRenderModule } from '@ledge-framework/render';

import { SkillTreeComponent } from './skill-tree.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [SkillTreeComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    LedgeRenderModule,
    RouterModule.forChild([{ path: '', component: SkillTreeComponent }]),
  ],
})
export class SkillTreeModule {}
