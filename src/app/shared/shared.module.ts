import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MarkdownRenderComponent } from './components/markdown-render/markdown-render.component';
import { MarkdownModule } from 'ngx-markdown';
import { CustomMaterialModule } from './custom-material.module';
import {MarkdownRadarChartComponent} from './components/markdown-radar-chart/markdown-radar-chart.component';
import {MarkdownRatingComponent} from './components/markdown-radar-chart/markdown-rating/markdown-rating.component';
import {MarkdownRatingItemComponent} from './components/markdown-radar-chart/markdown-rating-item/markdown-rating-item.component';

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
  ],
  providers: [
  ],
  exports: [
    MarkdownRenderComponent,
    MarkdownRatingComponent,
    MarkdownRatingItemComponent,
    MarkdownRadarChartComponent
  ],
  entryComponents: []
})
export class SharedModule {
}
