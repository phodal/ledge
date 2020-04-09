import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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

  @ViewChild('chart', {}) chart: ElementRef;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const myChart = echarts.init(this.chart.nativeElement);
    const treeData = LedgeChartConverter.toTreeData(this.data.children);
    const option = this.buildOption(treeData);
    myChart.setOption(option as any);
  }

  private buildOption(data) {
    const {indicator, legend, seriesData} = this.buildIndicatorAndSeries(data);

    return {
      toolbox: {
        feature: {
          saveAsImage: {},
        }
      },
      tooltip: {},
      legend: {
        bottom: 5,
        data: legend,
      },
      title: {
        text: data.name,
        left: 'center'
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
      series: [{type: 'radar', data: seriesData}],
    };
  }

  private buildIndicatorAndSeries(data) {
    let indicator: any[] = data.children;
    const legend = this.getLegend(data);
    const seriesData = [];
    if (this.hasRadarValue(data)) {
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
              areaStyle: {}
            };

            if (this.config.showValue) {
              seriesData[j].label = {
                show: true,
                  formatter: params => params.value
              };
            }
          }

          seriesData[j].name = legend[j];
          if (valuesSplit[j]) {
            seriesData[j].value.push(parseInt(valuesSplit[j], 10));
          }
          if (this.config.areaColor) {
            seriesData[j].areaStyle = this.config.areaColor[j];
          }
        }
      }
    }

    return {indicator, legend, seriesData};
  }

  private hasRadarValue(data) {
    const firstItemName = data.children[0].name;
    const hasValue = firstItemName.includes(': ') || firstItemName.includes('： ');
    return hasValue;
  }

  private getLegend(data) {
    let legend: any[] = [data.name];
    if (this.config && this.config.legend) {
      legend = this.config.legend;
    }
    return legend;
  }
}
