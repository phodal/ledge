import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ToolsetComponent } from './presentation/toolset/toolset.component';
import { ManualComponent } from './presentation/manual/manual.component';
import { MaturityComponent } from './presentation/maturity/maturity.component';
import { PatternComponent } from './presentation/pattern/pattern.component';
import { PractiseComponent } from './presentation/practise/practise.component';
import { ReporterComponent } from './presentation/reporter/reporter.component';
import { ResourcesComponent } from './presentation/resources/resources.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  {
    path: 'case-study',
    loadChildren: () =>
      import('./presentation/case-study/case-study.module').then(
        (m) => m.CaseStudyModule
      ),
  },
  {
    path: 'solution',
    loadChildren: () =>
      import('./presentation/solution/solution.module').then(
        (m) => m.SolutionModule
      ),
  },
  {
    path: 'checklists',
    loadChildren: () =>
      import('./presentation/checklists/checklists.module').then(
        (m) => m.ChecklistsModule
      ),
  },
  {
    path: 'partners',
    loadChildren: () =>
      import('./presentation/partners/partners.module').then(
        (m) => m.PartnersModule
      ),
  },
  {
    path: 'think-tank',
    loadChildren: () =>
      import('./presentation/think-tank/think-tank.module').then(
        (m) => m.ThinkTankModule
      ),
  },
  {
    path: 'pattern',
    component: PatternComponent,
  },
  {
    path: 'practise',
    component: PractiseComponent,
  },
  {
    path: 'manual',
    component: ManualComponent,
  },
  {
    path: 'maturity',
    component: MaturityComponent,
  },
  {
    path: 'resources',
    component: ResourcesComponent,
  },
  {
    path: 'report',
    component: ReporterComponent,
  },
  {
    path: 'tool',
    component: ToolsetComponent,
  },
  {
    path: 'design',
    loadChildren: () =>
      import('./presentation/design/design.module').then((m) => m.DesignModule),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./presentation/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'job',
    loadChildren: () =>
      import('./presentation/job/job.module').then((m) => m.JobModule),
  },
  {
    path: 'helper',
    loadChildren: () =>
      import('./presentation/ledge-helper/ledge-helper.module').then(
        (m) => m.LedgeHelperModule
      ),
  },
  {
    path: 'skilltree',
    loadChildren: () =>
      import('./presentation/skill-tree/skill-tree.module').then(
        (m) => m.SkillTreeModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
