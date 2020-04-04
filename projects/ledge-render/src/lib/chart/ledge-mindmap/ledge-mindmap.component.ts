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

  @ViewChild('chart', {}) reporter: ElementRef;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const myChart = echarts.init(this.reporter.nativeElement);
    const treeData = LedgeChartConverter.toTreeData(this.data.children);
    const option = this.buildMindmapOption(treeData);
    myChart.setOption(option as any);
  }

  buildMindmapOption(data) {
    let height = '600px';
    const dataStr = JSON.stringify(data);
    if (dataStr.length > 500) {
      height = '720px';
    }

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
          height,
          type: 'tree',
          roam: true,
          id: 0,
          name: 'tree1',
          data: [data],
          top: '12%',
          left: '18%',
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
            backgroundColor: '#fff',
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

          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750,
        },
      ],
    };
  }
}
