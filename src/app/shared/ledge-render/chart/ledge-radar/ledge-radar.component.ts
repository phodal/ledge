import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { LedgeList } from '../../../components/model/ledge-chart.model';
import * as echarts from 'echarts';
import LedgeChartConverter from '../../../components/model/ledge-chart-converter';

@Component({
  selector: 'ledge-radar',
  templateUrl: './ledge-radar.component.html',
  styleUrls: ['./ledge-radar.component.scss'],
})
export class LedgeRadarComponent implements OnInit, AfterViewInit {
  @Input()
  data: LedgeList;

  @ViewChild('chart', {}) reporter: ElementRef;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const myChart = echarts.init(this.reporter.nativeElement);
    const treeData = LedgeChartConverter.toTreeData(this.data.children);
    const option = this.buildOption(treeData);
    myChart.setOption(option as any);
  }

  private buildOption(data) {
    const value = [];
    let indicator: any[] = data.children;
    const firstName = data.children[0].name;
    if (firstName.includes(': ') || firstName.includes('： ')) {
      indicator = [];
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < data.children.length; i++) {
        const child = data.children[i];
        const split = child.name.split(': ');
        indicator.push({
          name: split[0],
          max: 5,
        });
        value.push(parseInt(split[1], 10));
      }
    }

    return {
      tooltip: {},
      legend: {
        data: [data.name],
      },
      radar: {
        name: {
          textStyle: {
            color: '#000',
            borderRadius: 3,
            padding: [3, 5],
            fontSize: 14,
          },
        },
        indicator,
      },
      series: [{ type: 'radar', data: [{ value, name: data.name }] }],
    };
  }
}
