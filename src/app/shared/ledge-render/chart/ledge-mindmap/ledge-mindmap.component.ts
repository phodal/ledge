import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { LedgeList } from '../../../components/model/ledge-chart.model';
import * as echarts from 'echarts';

@Component({
  selector: 'ledge-mindmap',
  templateUrl: './ledge-mindmap.component.html',
  styleUrls: ['./ledge-mindmap.component.scss']
})
export class LedgeMindmapComponent implements OnInit, AfterViewInit {
  @Input()
  data: LedgeList;

  @ViewChild('reporter', {}) reporter: ElementRef;

  constructor() {
  }

  ngOnInit(): void {
    console.log(this.data);
  }

  ngAfterViewInit(): void {
    const myChart = echarts.init(this.reporter.nativeElement);
    const treeData = this.toTreeData(this.data.children);
    const option = this.buildMindmapOption(treeData);
    console.log(option);
    myChart.setOption(option as any);
  }


  private toTreeData(data: any) {
    if (data.length === 1) {
      const anies = this.transformTreeData(data);
      return anies[0];
    }

    const treeInfo = this.transformTreeData(data);
    return {
      name: '',
      children: treeInfo,
      config: data.config
    };
  }

  private transformTreeData(data: any) {
    const nodes = [];
    for (const item of data) {
      const node: any = {};
      node.name = item.name;
      if (item.children && item.children.length > 0) {
        node.children = this.transformTreeData(item.children);
      }
      nodes.push(node);
    }
    return nodes;
  }

  buildMindmapOption(data) {
    let height = '600px';
    const dataStr = JSON.stringify(data);
    if (dataStr.length > 500) {
      height = '720px';
    }

    return {
      feature: {
        saveAsImage: {}
      },
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
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
            width: 2
          },

          label: {
            backgroundColor: '#fff',
            position: 'left',
            verticalAlign: 'middle',
            align: 'right',
            fontSize: 14
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
  }

}
