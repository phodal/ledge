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

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    console.log(this.data.chartData)
    const myChart = echarts.init(this.reporter.nativeElement);
    myChart.setOption({
      backgroundColor: '#2c343c',

      title: {
        text: this.data.title,
        left: 'center',
        top: 20,
        textStyle: {
          color: '#ccc'
        }
      },

      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      visualMap: {
        show: false,
        min: 80,
        max: 600,
        inRange: {
          colorLightness: [0, 1]
        }
      },
      series: [
        {
          type: 'pie',
          radius: '55%',
          center: ['50%', '50%'],
          data: this.data.chartData.sort((a, b) => a.value - b.value),
          roseType: 'radius',
          label: {
            color: 'rgba(255, 255, 255, 0.3)'
          },
          labelLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)'
            },
            smooth: 0.2,
            length: 10,
            length2: 20
          },
          itemStyle: {
            color: '#c23531',
            shadowBlur: 200,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },

          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: idx => Math.random() * 200
        }
      ]
    });
  }

}
