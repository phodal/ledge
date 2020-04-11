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
  selector: 'ledge-pyramid',
  templateUrl: './ledge-pyramid.component.html',
  styleUrls: ['./ledge-pyramid.component.scss'],
})
export class LedgePyramidComponent implements OnInit, AfterViewInit {
  @Input()
  data: LedgeList;

  @ViewChild('chart', {}) reporter: ElementRef;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const myChart = echarts.init(this.reporter.nativeElement);
    const treeData = LedgeChartConverter.toTreeData(this.data.children);
    const pyramidLength = treeData.children.length;
    const CHART_MAX_VALUE = 100;
    for (let i = 0; i < pyramidLength; i++) {
      treeData.children[i].value = (CHART_MAX_VALUE / pyramidLength) * (i + 1);
    }

    const option = this.buildOption(treeData);
    myChart.setOption(option as any);
  }

  private buildOption(data) {
    const seriesData = {
      name: data.name,
      type: 'funnel',
      sort: 'ascending',
      label: {
        show: true,
        position: 'inside',
        fontSize: 14,
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: 'solid',
        },
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1,
      },
      emphasis: {
        label: {
          fontSize: 24,
        },
      },
      data: data.children,
    };
    const series = this.buildSeries(data, seriesData);

    return {
      title: {
        text: data.name,
        top: 'bottom',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}',
      },
      series,
    };
  }

  private buildSeries(data, seriesData: any) {
    const series = [];
    const split = data.children[0].name.split('、');
    if (split.length === 2) {
      series.push(seriesData);
      const leftSeries = JSON.parse(JSON.stringify(seriesData));
      leftSeries.label.position = 'left';
      series.push(leftSeries);
      const rightSeries = JSON.parse(JSON.stringify(seriesData));
      rightSeries.label.position = 'right';
      series.push(rightSeries);

      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < data.children.length; i++) {
        const item = data.children[i];
        const center = item.name.split('：')[0];
        const othersSplit = item.name.split('：')[1].split('、');

        series[0].data[i].name = center;
        series[1].data[i].name = othersSplit[0];
        series[2].data[i].name = othersSplit[1];
      }

      // todo: remove hard code
      series[0].width = 'auto';
      series[1].width = 'auto';
      series[2].width = 'auto';
    } else {
      series.push(seriesData);
    }
    return series;
  }
}
