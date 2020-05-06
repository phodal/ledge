import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import echarts from 'echarts';

import { LedgeTable } from '../../components/model/ledge-chart.model';
import LedgeChartConverter from '../../components/model/ledge-chart-converter';

@Component({
  selector: 'ledge-heatmap',
  templateUrl: './ledge-heatmap.component.html',
  styleUrls: ['./ledge-heatmap.component.scss']
})
export class LedgeHeatmapComponent implements OnInit, AfterViewInit {
  @Input() data: LedgeTable;

  @Input() config: any;

  @ViewChild('chart', {}) chartEl: ElementRef;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const myChart = echarts.init(this.chartEl.nativeElement);
    const option = this.buildOption(this.data);
    myChart.setOption(option as any);
  }

  private buildOption(treeData: LedgeTable) {
    console.log(treeData);
    return {
      tooltip: {
        position: 'top'
      },
      animation: false,
      grid: {
        height: '50%',
        top: '10%'
      },
      xAxis: {
        type: 'category',
        data: treeData.header,
        splitArea: {
          show: true
        }
      },
      yAxis: {
        type: 'category',
        data: treeData.cells[0].reverse(),
        splitArea: {
          show: true
        }
      },
      visualMap: {
        min: 0,
        max: 10,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '15%'
      },
      series: [{
        name: 'Punch Card',
        type: 'heatmap',
        data: [[0, 0, 3], [0, 1, 2]],
        label: {
          show: true
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  }
}
