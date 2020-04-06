import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule, SecurityContext } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LedgeRenderModule } from '@ledge-framework/render';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { MarkdownRatingItemComponent } from '../features/rating-radar-chart/markdown-rating-item/markdown-rating-item.component';
import { MarkdownRatingComponent } from '../features/rating-radar-chart/markdown-rating/markdown-rating.component';
import { RatingRadarChartComponent } from '../features/rating-radar-chart/rating-radar-chart.component';
import { MarkdownRenderComponent } from '../features/markdown-render/markdown-render.component';
import { ProcessTableComponent } from '../presentation/home/process-table/process-table.component';
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
  providers: [],
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
