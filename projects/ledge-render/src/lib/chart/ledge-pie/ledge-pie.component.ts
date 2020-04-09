import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { LedgeList } from '../../components/model/ledge-chart.model';
import * as echarts from 'echarts';
import LedgeChartConverter from '../../components/model/ledge-chart-converter';

@Component({
  selector: 'ledge-pie',
  templateUrl: './ledge-pie.component.html',
  styleUrls: ['./ledge-pie.component.scss']
})
export class LedgePieComponent implements AfterViewInit {
  @Input()
  data: LedgeList;

  @Input()
  config: any;

  @ViewChild('chart', {}) chart: ElementRef;

  ngAfterViewInit(): void {
    const myChart = echarts.init(this.chart.nativeElement);
    const treeData = LedgeChartConverter.toTreeData(this.data.children);
    const option = this.buildOption(treeData);
    myChart.setOption(option as any);
  }

  private buildOption(treeData: any) {
    return {
      title: {
        text: '某站点用户访问来源',
        subtext: '纯属虚构',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
      },
      series: [
        {
          name: '访问来源',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: [
            {value: 335, name: '直接访问'},
            {value: 310, name: '邮件营销'},
            {value: 234, name: '联盟广告'},
            {value: 135, name: '视频广告'},
            {value: 1548, name: '搜索引擎'}
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  }
}
