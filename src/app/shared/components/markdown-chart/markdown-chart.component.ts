import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import * as echarts from 'echarts';
import {ReporterChartModel} from '../model/reporter-chart.model';

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
    console.log(this.data);
    const builderJson = this.data.chartData;
    const sortData = Object.keys(builderJson).map(key => builderJson[key]).sort((a, b) => a.value - b.value);
    myChart.setOption(this.buildBarChartOption(sortData) as any);
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
        data: sortData.map(data => data.name)
      }],
      series: [{
        type: 'bar',
        stack: 'chart',
        data: sortData,
        label: {
          normal: {
            show: true,
            position: 'right',
            formatter: data => data.value + '%'
          }
        }
      }]
    };
  }
}
