import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'component-markdown-tree',
  templateUrl: './markdown-tree.component.html',
  styleUrls: ['./markdown-tree.component.scss']
})
export class MarkdownTreeComponent implements OnInit, AfterViewInit {
  @ViewChild('tree', {}) treeElement: ElementRef;

  constructor() {

  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const myChart = echarts.init(this.treeElement.nativeElement);
    const data = {
      name: 'flare',
      children: [
        {
          name: 'data',
          children: [
            {
              name: 'converters',
              children: [
                {name: 'Converters', value: 721},
                {name: 'DelimitedTextConverter', value: 4294}
              ]
            },
            {
              name: 'DataUtil',
              value: 3322
            }
          ]
        },
        {
          name: 'display',
          children: [
            {name: 'DirtySprite', value: 8833},
            {name: 'LineSprite', value: 1732},
            {name: 'RectSprite', value: 3623}
          ]
        },
        {
          name: 'flex',
          children: [
            {name: 'FlareVis', value: 4116}
          ]
        },
        {
          name: 'query',
          children: []
        },
        {
          name: 'scale',
          children: [
            {name: 'IScaleMap', value: 2105},
            {name: 'LinearScale', value: 1316},
            {name: 'LogScale', value: 3151},
            {name: 'OrdinalScale', value: 3770},
            {name: 'QuantileScale', value: 2435},
            {name: 'QuantitativeScale', value: 4839},
            {name: 'RootScale', value: 1756},
            {name: 'Scale', value: 4268},
            {name: 'ScaleType', value: 1821},
            {name: 'TimeScale', value: 5833}
          ]
        }
      ]
    };
    const options = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      },
      series: [
        {
          type: 'tree',
          id: 0,
          name: 'tree1',
          data: [data],

          top: '10%',
          left: '8%',
          bottom: '22%',
          right: '20%',

          symbolSize: 7,

          edgeShape: 'polyline',
          edgeForkPosition: '63%',
          initialTreeDepth: 3,

          lineStyle: {
            width: 2
          },

          label: {
            backgroundColor: '#fff',
            position: 'left',
            verticalAlign: 'middle',
            align: 'right'
          },

          leaves: {
            label: {
              position: 'right',
              verticalAlign: 'middle',
              align: 'left'
            }
          },

          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750
        }
      ]
    };

    myChart.setOption(options as any);
  }
}
