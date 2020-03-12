import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import marked from 'marked';
import {ReporterChartModel} from '../model/reporter-chart.model';
import d3 from 'd3';

@Component({
  selector: 'component-markdown-reporter',
  templateUrl: './markdown-reporter.component.html',
  styleUrls: ['./markdown-reporter.component.scss']
})
export class MarkdownReporterComponent implements OnInit, AfterViewInit {
  @Input()
  content: string;
  charts: ReporterChartModel[] = [];

  constructor() {
  }

  ngOnInit(): void {
    this.buildChartData(this.content);
  }

  ngAfterViewInit(): void {

  }

  private buildChartData(content: string) {
    const tokens = marked.lexer(content);
    this.buildData(tokens);
  }

  private getColorByIndex(i: number) {
    const length = 20;
    // tslint: disable-next-line
    const color = d3.scale.linear().domain([1, length])
      .interpolate(d3.interpolateHcl as any)
      .range([d3.rgb('#007AFF'), d3.rgb('#FFF500')]);

    return color(i);
  }

  private buildData(tokens: marked.Token[]) {
    for (const token of tokens) {
      if (token.type === 'table') {
        if (token.cells[0].length === 2) {
          const chart: ReporterChartModel = {
            title: token.header[0],
            chartData: []
          };
          // tslint:disable-next-line:prefer-for-of
          for (let i = 0; i < token.cells.length; i++) {
            const cell = token.cells[i];
            chart.chartData.push({
              name: cell[0],
              value: parseFloat(cell[1]),
              itemStyle: {color: this.getColorByIndex(i)}
            });
          }
          this.charts.push(chart);
        }
      }
    }
  }
}
