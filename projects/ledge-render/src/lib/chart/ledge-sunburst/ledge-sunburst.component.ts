import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import { LedgeList, LedgeListItem } from '../../components/model/ledge-chart.model';


@Component({
  selector: 'ledge-sunburst',
  templateUrl: './ledge-sunburst.component.html',
  styleUrls: ['./ledge-sunburst.component.scss']
})
export class LedgeSunburstComponent implements OnInit, AfterViewInit {
  @Input()
  data: LedgeListItem[];

  @Input()
  config: any;

  @ViewChild('chart', {}) chart: ElementRef;

  private childLevel = 1;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const myChart = echarts.init(this.chart.nativeElement);
    const result = this.setValue(this.data, 0);
    console.log(result);
    const option = this.buildOption(this.data);
    console.log(this.data);
    myChart.setOption(option as any);
  }

  private buildOption(treeData: any) {
    return {
      visualMap: {
        type: 'continuous',
        min: 0,
        max: 10,
        inRange: {
          color: ['#2D5F73', '#538EA6', '#F2D1B3', '#F2B8A2', '#F28C8C']
        }
      },
      series: {
        type: 'sunburst',
        data: treeData,
        radius: [0, '90%'],
        label: {
          rotate: 'radial'
        }
      }
    };
  }

  private setValue(list: LedgeListItem[], value) {
    for (const item of list) {
      value++;
      if (item.children) {
        this.setValue(item.children, value);
        item.value = value;
      } else {
        item.value = 1;
        value = 0;
      }
    }

    return list;
  }
}
