import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import marked from 'marked/lib/marked';
import { ReporterChartModel } from '../model/reporter-chart.model';
import * as d3 from 'd3';

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
    d3.scaleLinear()
      .domain([0, 10])
      .range([0, 600]);

    const colors = d3.scaleLinear()
      .domain([0, 20])
      .range([d3.rgb('#ff4081'), d3.rgb('#66C2A5')] as any);

    return colors(i);
  }

  private buildData(tokens: marked.Token[]) {
    const markdownData = [];
    for (const token of tokens) {
      if (token.type === 'table') {
        if (token.cells[0].length === 2) {
          this.charts.push(this.buildMarkdownChart(token));
        }
      }
    }
  }

  private buildMarkdownChart(token: marked.Token) {
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
    return chart;
  }
}
