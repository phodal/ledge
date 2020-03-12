import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './presentation/home/home.component';
import { CaseStudyComponent } from './presentation/case-study/case-study.component';
import { PatternComponent } from './presentation/pattern/pattern.component';
import { DesignComponent } from './presentation/design/design.component';
import { PractiseComponent } from './presentation/practise/practise.component';
import { ManualComponent } from './presentation/manual/manual.component';
import {MaturityComponent} from './presentation/maturity/maturity.component';
import {ResourcesComponent} from './presentation/resources/resources.component';
import {ReporterComponent} from './presentation/reporter/reporter.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: '/home'},
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'casestudy',
    component: CaseStudyComponent
  },
  {
    path: 'pattern',
    component: PatternComponent
  },
  {
    path: 'design',
    component: DesignComponent
  },
  {
    path: 'practise',
    component: PractiseComponent
  },
  {
    path: 'manual',
    component: ManualComponent
  },
  {
    path: 'maturity',
    component: MaturityComponent
  },
  {
    path: 'resources',
    component: ResourcesComponent
  },
  {
    path: 'report',
    component: ReporterComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
