import { NgModule, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MarkdownRenderComponent } from './components/markdown-render/markdown-render.component';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { CustomMaterialModule } from './custom-material.module';
import { RatingRadarChartComponent } from './components/markdown-radar-chart/rating-radar-chart.component';
import { MarkdownRatingComponent } from './components/markdown-radar-chart/markdown-rating/markdown-rating.component';
import { MarkdownRatingItemComponent } from './components/markdown-radar-chart/markdown-rating-item/markdown-rating-item.component';
import { ProcessTableComponent } from './components/process-table/process-table.component';
import { LedgeRenderComponent } from './ledge-render/ledge-render.component';
import { LedgeBarChartComponent } from './ledge-render/chart/ledge-bar-chart/ledge-bar-chart.component';
import { MarkdownTreeComponent } from './components/markdown-tree/markdown-tree.component';
import { ToolsetComponent } from './toolset/toolset.component';

import Tocify from './components/markdown-render/tocify';
import { LedgeMindmapComponent } from './ledge-render/chart/ledge-mindmap/ledge-mindmap.component';
import { LedgePyramidComponent } from './ledge-render/chart/ledge-pyramid/ledge-pyramid.component';
import { LedgeRadarComponent } from './ledge-render/chart/ledge-radar/ledge-radar.component';
import { LedgeQuadrantComponent } from './ledge-render/chart/ledge-quadrant/ledge-quadrant.component';
import { LedgeGraphvizComponent } from './ledge-render/chart/ledge-graphviz/ledge-graphviz.component';

const LedgeComponents = [
  LedgeRenderComponent,
  LedgeBarChartComponent,
  LedgeMindmapComponent,
  LedgePyramidComponent,
  LedgeRadarComponent,
  LedgeQuadrantComponent,
  LedgeGraphvizComponent,

  ToolsetComponent,
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    CustomMaterialModule,
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
    MarkdownTreeComponent,

    ...LedgeComponents,
  ],
  providers: [Tocify],
  exports: [
    MarkdownRenderComponent,
    MarkdownRatingComponent,
    MarkdownRatingItemComponent,
    RatingRadarChartComponent,
    ProcessTableComponent,
    MarkdownTreeComponent,

    ...LedgeComponents,
  ],
  entryComponents: [],
})
export class SharedModule {}
