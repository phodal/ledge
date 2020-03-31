import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import marked from 'marked/lib/marked';
import { ReporterChartModel } from '../model/reporter-chart.model';
import * as d3 from 'd3';
import { Tokens } from 'marked';
import LedgeMarkdownConverter from '../model/ledge-markdown-converter';

@Component({
  selector: 'ledge-render',
  templateUrl: './ledge-render.component.html',
  styleUrls: ['./ledge-render.component.scss']
})
export class LedgeRenderComponent implements OnInit, AfterViewInit {
  @Input()
  content: string;
  charts: ReporterChartModel[] = [];
  markdownData: any[] = [];

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
    const colors = d3.scaleLinear()
      .domain([0, 8])
      .range([d3.rgb('#ff4081'), d3.rgb('#66C2A5')] as any);

    return colors(i);
  }

  private buildData(tokens: marked.Token[]) {
    for (const token of tokens) {
      switch (token.type) {
        case 'table':
          if (token.cells[0].length === 2) {
            const chartInfo = this.buildBarChartData(token);
            this.charts.push(chartInfo);
            this.markdownData.push({
              type: 'chart',
              data: chartInfo
            });
          } else {
            this.markdownData.push(token);
          }
          break;
        case 'code':
          const codeBlock = token as Tokens.Code;
          if (codeBlock.lang === 'chart') {
            const chartData = LedgeMarkdownConverter.toJson(codeBlock.text);
            this.markdownData.push({
              type: 'chart',
              data: this.buildBarChartData(chartData.tables[0])
            });
          } else {
            this.markdownData.push(token);
          }
          break;
        case 'space':
          break;
        default:
          // console.log(token);
          this.markdownData.push(token);
          break;
      }
    }
  }

  private buildBarChartData(token: marked.Table) {
    const chart: ReporterChartModel = {
      title: token.header[0],
      barChart: {
        xData: [],
        yData: []
      }
    };

    chart.barChart.xData = token.cells[0];
    const tableColumnLength = token.cells.length;
    for (let i = 1; i < tableColumnLength; i++) {
      const row = [];
      const originRow = token.cells[i];

      for (let j = 0; j < originRow.length; j++) {
        let color = this.getColorByIndex(i);
        if (tableColumnLength === 2) {
          color = this.getColorByIndex(j);
        }
        row.push({
          value: originRow[j],
          itemStyle: {color}
        });
      }
      chart.barChart.yData.push(row);
    }
    return chart;
  }

  stringify(str: any) {
    return JSON.stringify(str);
  }
}
