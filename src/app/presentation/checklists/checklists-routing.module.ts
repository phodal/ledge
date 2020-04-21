import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChecklistsComponent } from './checklists.component';

const routes: Routes = [
  {
    path: ':selectedIndex',
    component: ChecklistsComponent,
  },
  { path: '', pathMatch: 'full', redirectTo: '0' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChecklistsRoutingModule {}
