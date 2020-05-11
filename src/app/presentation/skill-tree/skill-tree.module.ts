import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LedgeRenderModule } from '@ledge-framework/render';

import { SkillTreeComponent } from './skill-tree.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: ':skilltree',
    component: SkillTreeComponent,
  },
  { path: '', pathMatch: 'full', redirectTo: 'devops-skilltree' },
];

@NgModule({
  declarations: [SkillTreeComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    LedgeRenderModule,
    RouterModule.forChild(routes),
  ],
})
export class SkillTreeModule {}
