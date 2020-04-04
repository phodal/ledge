import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import * as echarts from 'echarts';
import LedgeChartConverter from '../../components/model/ledge-chart-converter';
import { LedgeList } from '../../components/model/ledge-chart.model';

@Component({
  selector: 'ledge-radar',
  templateUrl: './ledge-radar.component.html',
  styleUrls: ['./ledge-radar.component.scss'],
})
export class LedgeRadarComponent implements OnInit, AfterViewInit {
  @Input()
  data: LedgeList;

  @Input()
  config: any;

  @ViewChild('chart', {}) reporter: ElementRef;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const myChart = echarts.init(this.reporter.nativeElement);
    const treeData = LedgeChartConverter.toTreeData(this.data.children);
    const option = this.buildOption(treeData);
    myChart.setOption(option as any);
  }

  private buildOption(data) {
    let indicator: any[] = data.children;

    let legend: any[] = [data.name];
    if (this.config && this.config.legend) {
      legend = this.config.legend;
    }
    const seriesData = [];

    const firstName = data.children[0].name;
    const hasValue = firstName.includes(': ') || firstName.includes('： ');
    if (hasValue) {
      indicator = [];
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < data.children.length; i++) {
        const child = data.children[i];
        const nameValuesSplit = child.name.split(': ');
        indicator.push({
          name: nameValuesSplit[0],
          max: 5,
        });
        const values = nameValuesSplit[1];
        const valuesSplit = values.split(' -&gt; ');
        // tslint:disable-next-line:prefer-for-of
        for (let j = 0; j < legend.length; j++) {
          if (!seriesData[j]) {
            seriesData[j] = {
              name: '',
              value: [],
            };
          }

          seriesData[j].name = legend[j];
          if (valuesSplit[j]) {
            seriesData[j].value.push(parseInt(valuesSplit[j], 10));
          }
        }
      }
    }

    return {
      tooltip: {},
      legend: {
        data: legend,
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
      series: [{ type: 'radar', data: seriesData }],
    };
  }
}
