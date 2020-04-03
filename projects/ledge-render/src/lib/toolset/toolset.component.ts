import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import * as echarts from 'echarts';
import { ToolsetOption } from './toolset';

@Component({
  selector: 'toolset',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss'],
})
export class ToolsetComponent implements OnInit, AfterViewInit {
  @ViewChild('tool', {}) toolEl: ElementRef;
  @ViewChild('lineChart', {}) lineChartEl: ElementRef;

  @Input()
  option: ToolsetOption;

  constructor() {}

  ngOnInit(): void {
    // console.log(this.option);
  }

  setToolsetStyle(option: ToolsetOption) {
    const element = document.getElementById(option.id);
    if (element == null) {
      return;
    }

    if (this.toolEl && this.toolEl.nativeElement) {
      this.toolEl.nativeElement.setAttribute(
        'style',
        `z-index: 999; top: ${element.offsetTop}px;position:absolute`
      );
      if (this.toolEl.nativeElement.clientHeight !== 0) {
        element.setAttribute(
          'style',
          `height: calc(${this.toolEl.nativeElement.clientHeight}px + 2em)`
        );
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
      width: 500,
      height: 500,
      xAxis: {
        type: 'category',
        data: ['Low', '挑战', 'High'],
        axisLine: {
          symbol: ['none', 'arrow'],
          symbolSize: [10, 20],
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'category',
        data: ['Low', '能力', 'High'],
        axisLine: {
          symbol: ['none', 'arrow'],
          symbolSize: [10, 20],
        },
        axisTick: {
          show: false,
        },
      },
      series: [
        {
          data: [],
          type: 'line',
          smooth: true,
        },
      ],
    };

    myChart.setOption(option as any);
  }
}
