import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MarkdownRenderComponent } from './components/markdown-render/markdown-render.component';
import { MarkdownModule } from 'ngx-markdown';
import { CustomMaterialModule } from './custom-material.module';
import { MarkdownRadarChartComponent } from './components/markdown-radar-chart/markdown-radar-chart.component';
import { MarkdownRatingComponent } from './components/markdown-radar-chart/markdown-rating/markdown-rating.component';
import { MarkdownRatingItemComponent } from './components/markdown-radar-chart/markdown-rating-item/markdown-rating-item.component';
import { ProcessTableComponent } from './components/process-table/process-table.component';
import {MarkdownReporterComponent} from './components/markdown-reporter/markdown-reporter.component';
import {MarkdownChartComponent} from './components/markdown-chart/markdown-chart.component';
import {MarkdownTreeComponent} from './components/markdown-tree/markdown-tree.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    MarkdownModule.forRoot({ loader: HttpClient })
  ],
  declarations: [
    MarkdownRenderComponent,
    MarkdownRatingComponent,
    MarkdownRatingItemComponent,
    MarkdownRadarChartComponent,
    ProcessTableComponent,
    MarkdownReporterComponent,
    MarkdownChartComponent,
    MarkdownTreeComponent,
  ],
  providers: [
  ],
  exports: [
    MarkdownRenderComponent,
    MarkdownRatingComponent,
    MarkdownRatingItemComponent,
    MarkdownRadarChartComponent,
    ProcessTableComponent,
    MarkdownReporterComponent,
    MarkdownChartComponent,
    MarkdownTreeComponent,
  ],
  entryComponents: []
})
export class SharedModule {
}
