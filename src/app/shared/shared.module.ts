import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule, SecurityContext } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LedgeRenderModule } from 'ledge-render';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { MarkdownRatingItemComponent } from './components/markdown-radar-chart/markdown-rating-item/markdown-rating-item.component';
import { MarkdownRatingComponent } from './components/markdown-radar-chart/markdown-rating/markdown-rating.component';
import { RatingRadarChartComponent } from './components/markdown-radar-chart/rating-radar-chart.component';
import { MarkdownRenderComponent } from './components/markdown-render/markdown-render.component';
import Tocify from './components/markdown-render/tocify';
import { ProcessTableComponent } from './components/process-table/process-table.component';
import { CustomMaterialModule } from './custom-material.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    LedgeRenderModule,
    MarkdownModule.forRoot({
      sanitize: SecurityContext.NONE,
      loader: HttpClient,
      markedOptions: {
        provide: MarkedOptions,
        useValue: {
          gfm: true,
          breaks: false,
          pedantic: false,
          smartLists: true,
          smartypants: false,
          langPrefix: 'language-',
          headerPrefix: '',
          headerIds: true,
        },
      },
    }),
  ],
  declarations: [
    MarkdownRenderComponent,
    MarkdownRatingComponent,
    MarkdownRatingItemComponent,
    RatingRadarChartComponent,
    ProcessTableComponent,
  ],
  providers: [Tocify],
  exports: [
    MarkdownRenderComponent,
    MarkdownRatingComponent,
    MarkdownRatingItemComponent,
    RatingRadarChartComponent,
    ProcessTableComponent,
  ],
  entryComponents: [],
})
export class SharedModule {}
