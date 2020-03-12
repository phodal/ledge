import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import marked from 'marked';
import {ReporterChartModel} from '../model/reporter-chart.model';

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

  private buildData(tokens: marked.Token[]) {
    for (const token of tokens) {
      if (token.type === 'table') {
        if (token.cells[0].length === 2) {
          const chart: ReporterChartModel = {
            title: token.header[0],
            chartData: []
          };
          for (const cell of token.cells) {
            chart.chartData.push({
              name: cell[0],
              value: parseFloat(cell[1])
            });
          }
          this.charts.push(chart);
        }
      }
    }
  }
}
