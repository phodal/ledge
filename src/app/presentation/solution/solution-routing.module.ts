import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SolutionComponent } from './solution.component';

const routes: Routes = [
  {
    path: ':solution',
    component: SolutionComponent,
  },
  { path: '', pathMatch: 'full', redirectTo: 'coding' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolutionRoutingModule {}
