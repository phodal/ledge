import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import { ChartData, ReporterChartModel } from '../model/reporter-chart.model';

@Component({
  selector: 'component-markdown-chart',
  templateUrl: './markdown-chart.component.html',
  styleUrls: ['./markdown-chart.component.scss']
})
export class MarkdownChartComponent implements OnInit, AfterViewInit {
  @Input()
  data: ReporterChartModel;

  @ViewChild('reporter', {}) reporter: ElementRef;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const myChart = echarts.init(this.reporter.nativeElement);
    const builderJson = this.data.barChart;
    myChart.setOption(this.buildBarChartOption(builderJson) as any);
  }

  private buildBarChartOption(sortData: any) {
    return {
      tooltip: {},
      title: [{
        text: this.data.title,
        left: '25%',
        textAlign: 'center'
      }],
      grid: [{
        left: 10,
        containLabel: true
      }],
      xAxis: [{
        show: false
      }],
      yAxis: [{
        type: 'category',
        data: sortData.xData
      }],
      series: this.buildSeries(sortData.yData)
    };
  }

  private buildSeries(sortData: ChartData[][]) {
    const barSeries = [];

    for (const y of sortData) {
      if (typeof y[0].value === 'string') {
        y.map((item) => {
          item.value = parseFloat(item.value as string);
        });
      }

      barSeries.push({
        type: 'bar',
        data: y,
        label: {
          normal: {
            show: true,
            position: 'right',
            formatter: data => data.value + '%'
          }
        }
      });
    }

    return barSeries;
  }
}
