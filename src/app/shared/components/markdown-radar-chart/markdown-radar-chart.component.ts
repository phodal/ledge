import { AfterViewInit, Component, ElementRef, forwardRef, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import RadarChart from './RadarChart.js';
import MarkdownHelper from '../model/markdown.helper';
import { MarkdownListModel } from '../model/markdown.model';

import d3 from 'd3';

@Component({
  selector: 'component-markdown-radar-chart',
  templateUrl: './markdown-radar-chart.component.html',
  styleUrls: ['./markdown-radar-chart.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MarkdownRadarChartComponent),
      multi: true
    }
  ]
})
export class MarkdownRadarChartComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  @ViewChild('baseElement', {}) baseElement: ElementRef;
  items: any[];
  data: any[] = [];
  value: any;
  private disabled: boolean;

  constructor() {
  }

  ngOnInit() {
  }

  onChange(value: any) {

  }

  onTouched() {
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    this.value = obj;
    if (!this.value) {
      return;
    }

    this.items = this.value;
    this.render();
  }

  ngAfterViewInit(): void {

  }

  updateModel($event: any) {
    this.onChange($event);
  }

  private taskToData() {
    const current: any[] = [];
    const future: any[] = [];
    for (const task of this.items) {
      const item: MarkdownListModel = task.item;
      MarkdownHelper.buildRatingValue(item);

      current.push({axis: item.chartText, value: item.chartValue});
      future.push({axis: item.chartText, value: item.chartFutureValue});
    }

    return [current, future];
  }

  /* tslint:disable */
  render() {
    if (!this.items) {
      return;
    }
    this.data = this.taskToData();

    const w = 500;
    const h = 500;

    let colorscale = d3.scale.category10();

    let LegendOptions = ['Current', 'Future'];
    let data = this.data;

    // Options for the Radar chart, other than default
    let mycfg = {
      width: w,
      height: h,
      maxValue: 5,
      levels: 5,
      ExtraWidthX: 300
    };

    RadarChart.draw('#chart', data, mycfg);

    let svg = d3.select('#body')
      .selectAll('svg')
      .append('svg')
      .attr('width', w + 300)
      .attr('height', h);

    let legend = svg.append('g')
      .attr('class', 'legend')
      .attr('height', 100)
      .attr('width', 200)
      .attr('transform', 'translate(90,20)');

    legend.selectAll('rect')
      .data(LegendOptions)
      .enter()
      .append('rect')
      .attr('x', w - 65)
      .attr('y', (d, i) => i * 20)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', function(d, i) {
        return colorscale(i.toString());
      });

    legend.selectAll('text')
      .data(LegendOptions)
      .enter()
      .append('text')
      .attr('x', w - 52)
      .attr('y', function(d, i) {
        return i * 20 + 9;
      })
      .attr('font-size', '11px')
      .attr('fill', '#737373')
      .text(function(d) {
        return d;
      });
  }
}
