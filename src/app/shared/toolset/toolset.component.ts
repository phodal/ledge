import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'toolset',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss']
})
export class ToolsetComponent implements OnInit, AfterViewInit {
  @ViewChild('tool', {}) toolEl: ElementRef;
  @ViewChild('lineChart', {}) lineChartEl: ElementRef;

  @Input()
  option: ToolsetOption;

  constructor() {
  }

  ngOnInit(): void {
    console.log(this.option);
  }

  setToolsetStyle(option: ToolsetOption) {
    const element = document.getElementById(option.id);
    if (element == null) {
      return;
    }

    if (this.toolEl && this.toolEl.nativeElement) {
      this.toolEl.nativeElement.setAttribute('style', `z-index: 999; top: ${element.offsetTop}px;position:absolute`);
      if (this.toolEl.nativeElement.clientHeight !== 0) {
        element.setAttribute('style', `height: calc(${this.toolEl.nativeElement.clientHeight}px + 2em)`);
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.option.type === 'line-chart') {
      this.renderLineChart(this.option.data);
    }

    setTimeout(() => {
      this.setToolsetStyle(this.option);
    }, 500);
  }

  private renderLineChart(data) {
    const myChart = echarts.init(this.lineChartEl.nativeElement);
    const option = {
      xAxis: {
        type: 'category',
        data: ['Low', 'Middle', 'High'],
        axisLine: {
          symbol: ['none', 'arrow'],
          symbolSize: [10, 20]
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          symbol: ['none', 'arrow'],
          symbolSize: [10, 20]
        },
        axisTick: {
          show: false
        }
      },
      series: [{
        data: ['Low', 'Middle', 'High'],
        type: 'line',
        smooth: true
      }]
    };

    myChart.setOption(option as any);
  }
}
