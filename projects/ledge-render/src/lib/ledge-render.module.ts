import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TohtmlPipe } from './pipes/tohtml.pipe';

import { LedgeBarChartComponent } from './chart/ledge-bar-chart/ledge-bar-chart.component';
import { LedgeGraphvizComponent } from './chart/ledge-graphviz/ledge-graphviz.component';
import { LedgeMindmapComponent } from './chart/ledge-mindmap/ledge-mindmap.component';
import { LedgePureEchartsComponent } from './chart/ledge-pure-echarts/ledge-pure-echarts.component';
import { LedgePyramidComponent } from './chart/ledge-pyramid/ledge-pyramid.component';
import { LedgeQuadrantComponent } from './chart/ledge-quadrant/ledge-quadrant.component';
import { LedgeRadarComponent } from './chart/ledge-radar/ledge-radar.component';
import { CustomMaterialModule } from './custom-material.module';
import { LedgeRenderComponent } from './ledge-render.component';
import { ToolsetComponent } from './toolset/toolset.component';
import { LedgeStepLineComponent } from './components/ledge-step-line/ledge-step-line.component';
import { LedgeCardComponent } from './components/ledge-card/ledge-card.component';
import { LedgeTableStepComponent } from './components/ledge-table-step/ledge-table-step.component';
import { LedgePieComponent } from './chart/ledge-pie/ledge-pie.component';
import { LedgeDevProcessComponent } from './components/ledge-dev-process/ledge-dev-process.component';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { LedgeTechRadarComponent } from './chart/ledge-tech-radar/ledge-tech-radar.component';
import { LedgePipelineComponent } from './chart/ledge-pipeline/ledge-pipeline.component';
import { LedgeKanbanComponent } from './components/ledge-kanban/ledge-kanban.component';
import { ComponentTodoComponent } from './components/component-todo/component-todo.component';
import { ComponentChecklistComponent } from './components/component-checklist/component-checklist.component';
import { LedgeStorageService } from './services/ledge-storage.service';
import { LedgeChecklistComponent } from './components/ledge-checklist/ledge-checklist.component';
import { LedgeMermaidComponent } from './components/ledge-mermaid/ledge-mermaid.component';
import { LedgeSunburstComponent } from './chart/ledge-sunburst/ledge-sunburst.component';
import { LedgeFishBoneComponent } from './chart/ledge-fish-bone/ledge-fish-bone.component';
import { LedgeHeatmapComponent } from './chart/ledge-heatmap/ledge-heatmap.component';
import { LedgeMaturityComponent } from './components/ledge-maturity/ledge-maturity.component';
import { ComponentRatingItemComponent } from './components/component-rating-item/component-rating-item.component';
import { ComponentRatingComponent } from './components/component-rating/component-rating.component';

const LedgeComponents = [
  LedgeRenderComponent,
  LedgeBarChartComponent,
  LedgeMindmapComponent,
  LedgePyramidComponent,
  LedgeRadarComponent,
  LedgeQuadrantComponent,
  LedgeGraphvizComponent,
  LedgePureEchartsComponent,
  LedgeStepLineComponent,
  ToolsetComponent,
  LedgeCardComponent,
  LedgeTableStepComponent,
  LedgePieComponent,
  LedgeDevProcessComponent,
  LedgeTechRadarComponent,
  LedgePipelineComponent,
  LedgeKanbanComponent,
  LedgeChecklistComponent,
  LedgeMermaidComponent,
  LedgeSunburstComponent,
  LedgeFishBoneComponent,
  LedgeHeatmapComponent,
  LedgeMaturityComponent,

  ComponentTodoComponent,
  ComponentChecklistComponent,
  ComponentRatingItemComponent,
  ComponentRatingComponent,
];

const LedgePipes = [TohtmlPipe];

@NgModule({
  declarations: [...LedgePipes, ...LedgeComponents],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    VirtualScrollerModule,
  ],
  providers: [LedgeStorageService],
  exports: [LedgeRenderComponent, ComponentChecklistComponent, ...LedgePipes],
})
export class LedgeRenderModule {
}
