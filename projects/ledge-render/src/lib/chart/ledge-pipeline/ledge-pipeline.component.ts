import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as d3 from 'd3';

import {
  JobState,
  Color,
  Stage,
  Job,
  PipelineConfig,
  PolygonPoints,
} from './ledge-pipeline.model';

@Component({
  selector: 'ledge-pipeline',
  templateUrl: './ledge-pipeline.component.html',
  styleUrls: ['./ledge-pipeline.component.scss']
})
export class LedgePipelineComponent implements AfterViewInit {
  @Input()
  data: Stage[];

  @Input()
  config: PipelineConfig = {
    connectionStrokeWidth: 4,
    stateStrokeWidth: 4,
    stateRadius: 16,
    stageSpace: 60,
    stageLabelHeight: 30,
    stageLabelSize: '16px',
    jobHeight: 60,
    jobLabelSize: '12px',
    startNodeRadius: 12,
    startNodeSpace: 40,
    endNodeRadius: 12,
    endNodeSpace: 40,
  };

  @ViewChild('pipeline', { static: false }) pipeline: ElementRef;

  ngAfterViewInit(): void {
    const maxJobsCountInStage = d3.max(this.data.map(stage => stage.jobs.length));
    const svgWidth =
      2 * 2 * (this.config.startNodeRadius + this.config.startNodeSpace)
      + this.data.length * 2 * (this.config.stageSpace + this.config.stateRadius + this.config.stateStrokeWidth);
    const svgHeight =
      this.config.stageLabelHeight
      + maxJobsCountInStage * (this.config.stateRadius + this.config.jobHeight);
    const svg = d3.select(this.pipeline.nativeElement)
      .append('svg')
      .attr('width', '100%')
      .attr('viewBox', `-20 0 ${svgWidth + 20} ${svgHeight + 20}`);

    this.renderPipeline(svg, this.data);
  }

  private renderPipeline(svg, stages: Stage[]) {
    const [startNode, ...rest] = this.generateTransformCoordinates(stages);
    const [endNode, ...reversedStages] = rest.reverse();

    this.renderStartNode(
      svg.append('g').attr('transform', `translate(${startNode.x}, ${startNode.y})`)
    );

    reversedStages.reverse().forEach(({ x, y }, index) => {
      this.renderStage(
        svg.append('g').attr('transform', `translate(${x}, ${y})`),
        stages[index]
      );
    });

    this.renderEndNode(
      svg.append('g').attr('transform', `translate(${endNode.x}, ${endNode.y})`)
    );
  }

  /**
   * Each stage use transform do relative position
   * Composite Start/End node with stage nodes
   */
  private generateTransformCoordinates(stages: Stage[]) {
    const startNodeContainerWidth = 2 * this.config.startNodeRadius + this.config.startNodeSpace;
    const stageContainerWidth = 2 * (this.config.stageSpace + this.config.stateRadius);
    const yCoordinate = 60;
    const xCoordinates = [];
    // Start node
    const startCoordinates = [{ x: 0, y: yCoordinate }];

    // Each stage
    stages.forEach((_, index) => {
      xCoordinates.push(stageContainerWidth * index);
    });

    // End node
    const endCoordinate = [{
      x: startNodeContainerWidth + stages.length * stageContainerWidth,
      y: yCoordinate,
    }];

    return [].concat(
      startCoordinates,
      xCoordinates.map(x => ({
        x: x + startNodeContainerWidth,
        y: yCoordinate,
      })),
      endCoordinate
    );
  }

  private renderStage(context, stage: Stage) {
    const [firstJob, ...restJobs] = stage.jobs;
    const isMultiJob = restJobs && !!restJobs.length;

    this.renderFirstJob(context, firstJob, isMultiJob);

    restJobs.forEach((job, jobIndex) => {
      this.renderJob(context, job, jobIndex + 1);
    });

    // Label
    context.append('text')
      .attr('x', this.config.stageSpace + this.config.stateRadius)
      .attr('y', -this.config.stageLabelHeight)
      .attr('text-anchor', 'middle')
      .attr('style', `font-size: ${this.config.stageLabelSize}`)
      .text(stage.label);
  }

  private renderFirstJob(context, job: Job, isMultiJob: boolean) {
    // Line
    const path = d3.path();
    path.moveTo(0, 0);
    path.lineTo(2 * (this.config.stageSpace + this.config.stateRadius), 0);
    context.append('path')
      .attr('stroke-width', this.config.connectionStrokeWidth)
      .attr('stroke', Color.GRAY)
      .attr('d', path);

    // State
    this.renderState(
      context.append('g').attr('transform', `translate(${this.config.stageSpace}, 0)`),
      job.state
    );

    // Add label only for stage which has multiple jobs
    if (isMultiJob) {
      context.append('text')
        .attr('x', this.config.stageSpace + this.config.stateRadius)
        .attr('y', this.config.stageLabelHeight)
        .attr('text-anchor', 'middle')
        .attr('style', `font-size: ${this.config.jobLabelSize}`)
        .text(job.label);
    }
  }

  private renderJob(context, job: Job, jobNumber) {
    this.renderJobLine(
      context.append('g')
        .attr('transform', `translate(0, -${this.config.stateRadius})`)
        .attr('fill', 'none')
        .attr('stroke-width', this.config.connectionStrokeWidth)
        .attr('stroke', Color.GRAY),
      jobNumber
    );

    // State
    this.renderState(
      context.append('g')
        .attr('transform', `translate(${this.config.stageSpace}, ${jobNumber * (2 * this.config.stateRadius + this.config.jobHeight)})`),
      job.state
    );

    // Label
    context.append('text')
      .attr('x', this.config.stageSpace + this.config.stateRadius)
      .attr('y', jobNumber * (2 * this.config.stateRadius + this.config.jobHeight) + this.config.stageLabelHeight)
      .attr('style', `font-size: ${this.config.jobLabelSize}`)
      .attr('text-anchor', 'middle')
      .text(job.label);
  }

  private renderJobLine(context, jobNumber) {
    const path = d3.path();
    const stateDiameter = 2 * this.config.stateRadius;
    path.arc(0, stateDiameter, this.config.stateRadius, Math.PI * 3 / 2, 0);
    path.arc(
      stateDiameter,
      jobNumber * (stateDiameter + this.config.jobHeight),
      this.config.stateRadius,
      Math.PI * 2 / 2,
      Math.PI * 1 / 2,
      true
    );
    path.arc(
      2 * this.config.stageSpace,
      jobNumber * (stateDiameter + this.config.jobHeight),
      this.config.stateRadius,
      Math.PI * 1 / 2,
      0,
      true
    );
    path.arc(
      2 * (this.config.stageSpace + this.config.stateRadius),
      stateDiameter,
      this.config.stateRadius,
      Math.PI * 2 / 2,
      Math.PI * 3 / 2
    );
    context.append('path').attr('d', path);
  }

  private renderState(context, state: JobState) {
    const {
      polygonPoints,
      circleStrokeWidth,
      circleStroke,
      circleFill,
      symbolStroke,
      symbolFill,
    } = this.getStateConfig(state);

    // Circle
    const path = d3.path();
    path.arc(this.config.stateRadius, 0, this.config.stateRadius, 0, 2 * Math.PI);
    context.append('path')
      .attr('stroke-width', circleStrokeWidth)
      .attr('stroke', circleStroke)
      .attr('fill', circleFill)
      .attr('d', path);

    // Symbol
    context.append('g')
      .attr('transform', `translate(${this.config.stateRadius}, 0)`)
      .append('polygon')
      .attr('points', polygonPoints)
      .attr('stroke', symbolStroke)
      .attr('fill', symbolFill);
  }

  private renderStartNode(context) {
    // Circle
    const path = d3.path();
    path.arc(this.config.startNodeRadius, 0, this.config.startNodeRadius, 0, 2 * Math.PI);
    context.append('path').attr('d', path).attr('fill', Color.GRAY);

    // Connector
    const linePath = d3.path();
    linePath.moveTo(2 * this.config.startNodeRadius, 0);
    linePath.lineTo(2 * this.config.startNodeRadius + this.config.startNodeSpace, 0);
    linePath.closePath();
    context.append('path')
      .attr('d', linePath)
      .attr('stroke', Color.GRAY)
      .attr('stroke-width', this.config.connectionStrokeWidth);

    // Label
    context.append('text')
      .attr('x', this.config.startNodeRadius)
      .attr('y', -this.config.stageLabelHeight)
      .attr('text-anchor', 'middle')
      .text('Start');
  }

  private renderEndNode(context) {
    // Circle
    const path = d3.path();
    path.arc(this.config.endNodeSpace + this.config.endNodeRadius, 0, this.config.endNodeRadius, 0, 2 * Math.PI);
    context.append('path').attr('d', path).attr('fill', Color.GRAY);

    // Connector
    const linePath = d3.path();
    linePath.moveTo(0, 0);
    linePath.lineTo(this.config.endNodeSpace, 0);
    linePath.closePath();
    context.append('path')
      .attr('d', linePath)
      .attr('stroke', Color.GRAY)
      .attr('stroke-width', this.config.connectionStrokeWidth);

    // Label
    context.append('text')
      .attr('x', this.config.endNodeRadius + this.config.endNodeSpace)
      .attr('y', -this.config.stageLabelHeight)
      .attr('text-anchor', 'middle')
      .text('End');
  }

  private getStateConfig(state: JobState): {
    polygonPoints: string,
    circleStrokeWidth: number,
    circleStroke: Color,
    circleFill: Color,
    symbolStrokeWidth: Color,
    symbolStroke: Color,
    symbolFill: Color,
  } {
    const config = {
      polygonPoints: '',
      circleStrokeWidth: this.config.stateStrokeWidth,
      circleStroke: Color.WHITE,
      circleFill: Color.GREEN,
      symbolStrokeWidth: Color.WHITE,
      symbolStroke: Color.WHITE,
      symbolFill: Color.WHITE,
    };

    switch (state) {
      case JobState.SUCCESS:
        return {
          ...config,
          polygonPoints: PolygonPoints.checkMark,
          circleFill: Color.GREEN,
          circleStroke: Color.GREEN,
        };
      case JobState.ERROR:
        return {
          ...config,
          polygonPoints: PolygonPoints.crossMark,
          circleFill: Color.RED,
          circleStroke: Color.RED,
        };
      case JobState.UNTOUCHED:
      case JobState.PROCESSING:
      case JobState.CURRENT:
      case JobState.PENDING:
        return {
          ...config,
          circleFill: Color.WHITE,
          circleStroke: Color.GRAY,
        };
    }
  }
}
