import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CaseStudyComponent } from './case-study.component';

const routes: Routes = [
  {
    path: ':case',
    component: CaseStudyComponent,
  },
  { path: '', pathMatch: 'full', redirectTo: 'meituan' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaseStudyRoutingModule {}
