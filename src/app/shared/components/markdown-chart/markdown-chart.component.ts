import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'component-markdown-chart',
  templateUrl: './markdown-chart.component.html',
  styleUrls: ['./markdown-chart.component.scss']
})
export class MarkdownChartComponent implements OnInit, AfterViewInit {
  @ViewChild('reporter', {}) reporter: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const myChart = echarts.init(this.reporter.nativeElement);
    myChart.setOption({
      backgroundColor: '#2c343c',

      title: {
        text: 'Customized Pie',
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
          name: '访问来源',
          type: 'pie',
          radius: '55%',
          center: ['50%', '50%'],
          data: [
            {value: 335, name: '直接访问'},
            {value: 310, name: '邮件营销'},
            {value: 274, name: '联盟广告'},
            {value: 235, name: '视频广告'},
            {value: 400, name: '搜索引擎'}
          ].sort((a, b) => a.value - b.value),
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
