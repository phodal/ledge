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
  selector: 'ledge-mindmap',
  templateUrl: './ledge-mindmap.component.html',
  styleUrls: ['./ledge-mindmap.component.scss'],
})
export class LedgeMindmapComponent implements OnInit, AfterViewInit {
  @Input()
  data: LedgeList;

  chartData: any;
  dataLevel = 1;
  dataSize = 1;
  chartOption: any;

  @ViewChild('chart', {}) chart: ElementRef;

  constructor() {}

  ngOnInit(): void {
    this.chartData = LedgeChartConverter.toTreeData(this.data.children);
    this.getDataLevel(this.chartData);
    this.chartOption = this.buildMindmapOption(this.chartData);
  }

  ngAfterViewInit(): void {
    const myChart = echarts.init(this.chart.nativeElement);
    myChart.setOption(this.chartOption as any);
  }

  getDataLevel(data) {
    this.dataLevel++;
    if (data.children) {
      this.getDataLevel(data.children);
    } else {
      this.dataSize = (this.dataLevel + 1) * data.length;
    }
  }

  getHeight() {
    const height = this.dataSize * 50 + 'px';
    const width = (this.dataLevel + 1) * 320 + 'px';
    return {
      height,
      width
    };
  }

  buildMindmapOption(data) {
    return {
      feature: {
        saveAsImage: {},
      },
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
      },
      series: [
        {
          type: 'tree',
          roam: 'move',
          id: 0,
          name: 'tree1',
          data: [data],
          top: '12%',
          left: '20%',
          bottom: '12%',
          right: '40%',
          symbolSize: 12,
          edgeShape: 'polyline',
          edgeForkPosition: '63%',
          initialTreeDepth: 3,
          lineStyle: {
            width: 2,
          },
          label: {
            position: 'left',
            verticalAlign: 'middle',
            align: 'right',
            fontSize: 14,
          },
          leaves: {
            label: {
              position: 'right',
              verticalAlign: 'middle',
              align: 'left',
            },
          },
          expandAndCollapse: false,
          animationDuration: 550,
          animationDurationUpdate: 750,
        },
      ],
    };
  }
}
