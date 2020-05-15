import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import * as d3 from 'd3';
import * as echarts from 'echarts';
import {
  ChartData,
  LedgeChartModel, LedgeTable
} from '../../components/model/ledge-chart.model';

@Component({
  selector: 'ledge-bar-chart',
  templateUrl: './ledge-bar-chart.component.html',
  styleUrls: ['./ledge-bar-chart.component.scss'],
})
export class LedgeBarChartComponent implements OnInit, AfterViewInit {
  @Input() data: LedgeTable;

  @ViewChild('chart', {}) reporter: ElementRef;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const myChart = echarts.init(this.reporter.nativeElement);
    const builderJson = this.buildBarChartData(this.data);
    myChart.setOption(this.buildBarChartOption(builderJson) as any);
  }

  private getColorByIndex(i: number) {
    const colors = d3
      .scaleLinear()
      .domain([0, 8])
      .range([d3.rgb('#7753df'), d3.rgb('#66C2A5')] as any);

    return colors(i);
  }

  private buildBarChartData(token: LedgeTable): LedgeChartModel {
    const chart: LedgeChartModel = {
      title: token.header[0],
      barChart: {
        xAxis: [],
        yAxis: [],
      },
    };

    chart.barChart.xAxis = token.cells[0];

    this.buildYAxis(token, chart);
    return chart;
  }

  private buildYAxis(token: LedgeTable, chart: LedgeChartModel) {
    const tableColumnLength = token.cells.length;
    for (let i = 1; i < tableColumnLength; i++) {
      const row = [];
      const originRow = token.cells[i];

      for (let j = 0; j < originRow.length; j++) {
        let color = this.getColorByIndex(i);
        if (tableColumnLength === 2) {
          color = this.getColorByIndex(j);
        }
        row.push({
          value: originRow[j],
          itemStyle: { color },
        });
      }

      chart.barChart.yAxis.push(row);
    }
  }

  private buildBarChartOption(sortData: LedgeChartModel) {
    return {
      tooltip: {},
      title: [
        {
          text: sortData.title,
          left: '25%',
          textAlign: 'center',
        },
      ],
      grid: [
        {
          left: 10,
          containLabel: true,
        },
      ],
      xAxis: [
        {
          show: false,
        },
      ],
      yAxis: [
        {
          type: 'category',
          data: sortData.barChart.xAxis,
        },
      ],
      series: this.buildSeries(sortData.barChart.yAxis),
    };
  }

  private buildSeries(sortData: ChartData[][]) {
    const barSeries = [];

    for (const y of sortData) {
      if (typeof y[0].value === 'string') {
        y.map((item) => {
          item.value = parseFloat(item.value as string);
        });
      }

      barSeries.push({
        type: 'bar',
        data: y,
        label: {
          normal: {
            show: true,
            position: 'right',
            formatter: (data) => data.value + '%',
          },
        },
      });
    }

    return barSeries;
  }
}
