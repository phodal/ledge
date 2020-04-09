import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { LedgeList } from '../../components/model/ledge-chart.model';
import * as echarts from 'echarts';

@Component({
  selector: 'ledge-pie',
  templateUrl: './ledge-pie.component.html',
  styleUrls: ['./ledge-pie.component.scss']
})
export class LedgePieComponent implements AfterViewInit {
  @Input()
  data: LedgeList;

  @Input()
  config: any;

  @ViewChild('chart', {}) chart: ElementRef;

  ngAfterViewInit(): void {
    const myChart = echarts.init(this.chart.nativeElement);
    const option = this.buildOption(this.data[0]);
    myChart.setOption(option as any);
  }

  private buildOption(data: any) {
    const ledgeData = [];
    const seriesData = [];

    if (data.children) {
      for (const child of (data.children as any[])) {
        const nameValueSplit = child.name.split(': ');
        ledgeData.push(nameValueSplit[0]);
        seriesData.push({
          value: nameValueSplit[1],
          name: nameValueSplit[0]
        });
      }
    } else {
      return {};
    }

    return {
      title: {
        text: data.name,
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'right',
        data: ledgeData
      },
      series: [
        {
          name: data.name,
          type: 'pie',
          radius: '60%',
          data: seriesData,
          label: {
            normal: {
              show: true,
              position: 'inner',
              formatter(params) {
                return params.value + '%\n';
              },
            }
          }
        }
      ]
    };
  }
}
