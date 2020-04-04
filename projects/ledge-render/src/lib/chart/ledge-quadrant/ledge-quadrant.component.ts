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
  selector: 'ledge-quadrant',
  templateUrl: './ledge-quadrant.component.html',
  styleUrls: ['./ledge-quadrant.component.scss'],
})
export class LedgeQuadrantComponent implements OnInit, AfterViewInit {
  @Input()
  data: LedgeList;

  @ViewChild('chart', {}) reporter: ElementRef;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const myChart = echarts.init(this.reporter.nativeElement);
    const treeData = LedgeChartConverter.toTreeData(this.data.children);
    const option = this.buildOption(treeData);
    myChart.setOption(option as any);
  }

  buildConfig(data, graphic: any[]) {
    if (data.config && data.config.left) {
      const keys = Object.keys(data.config);
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const graphConfig: any = {
          type: 'group',
          bounding: 'all',
          children: [
            {
              type: 'text',
              style: {fill: '#000', text: '', fontSize: 18},
            },
          ],
        };

        const {textValueKey, textValueKey} = this.buildGraphConfig(data, key, graphConfig);
        graphic.push(graphConfig);
      }
    }
  }

  private buildGraphConfig(data, key: string, graphConfig: any) {
    const textValue = data.config[key];
    graphConfig.children[0].style.text = textValue;
    switch (key) {
      case 'left':
        graphConfig.top = 'middle';
        graphConfig.left = 30;
        graphConfig.children[0].style.text = '';
        for (const textValueKey of textValue) {
          graphConfig.children[0].style.text += textValueKey + '\n';
        }
        break;
      case 'right':
        graphConfig.top = 'middle';
        graphConfig.right = 30;
        graphConfig.children[0].style.text = '';
        for (const textValueKey of textValue) {
          graphConfig.children[0].style.text += textValueKey + '\n';
        }
        break;
      case 'bottom':
        graphConfig.left = 'center';
        graphConfig.bottom = 30;
        break;
      case 'top':
        graphConfig.left = 'center';
        graphConfig.top = 30;
        break;
    }
    return {textValueKey, textValueKey};
  }

  buildOption(data) {
    if (!data.children) {
      return;
    }
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < data.children.length; i++) {
      data.children[i].value = 25;
    }
    const quadData = [
      {
        name: 'left',
        value: 50,
        children: [data.children[3], data.children[2]],
      },
      {
        name: 'right',
        value: 50,
        children: [data.children[1], data.children[0]],
      },
    ];

    // tslint:disable-next-line:no-shadowed-variable
    const graphic = [];
    this.buildConfig(data, graphic);

    return {
      title: {text: data.name, left: 'center',},
      graphic,
      series: [
        {
          roam: false,
          label: this.buildLabelInfo(),
          type: 'treemap',
          breadcrumb: {
            show: false,
          },
          visualMin: 0,
          visualMax: 1,
          visualDimension: 1,
          levels: [
            {
              itemStyle: {
                borderWidth: 2,
                borderColor: '#333',
                gapWidth: 2,
              },
            },
            {
              color: ['#09c95e', '#7f195e', '#666666', '#008988'],
              colorMappingBy: 'id',
              itemStyle: {
                gapWidth: 1,
              },
            },
          ],
          data: quadData,
        },
      ],
    };
  }

  private buildLabelInfo() {
    return {
      normal: {
        position: 'insideTopLeft',
        formatter: (params) => {
          const children: any[] = params.data.children;
          const arr = ['{name|' + params.name + '}', '{hr|}'];

          for (const child of children) {
            arr.push(`{child|` + child.name + '}');
          }

          return arr.join('\n');
        },
        rich: {
          child: {
            fontSize: 16,
            lineHeight: 30,
            align: 'left',
            color: 'white',
          },
          name: {
            fontSize: 20,
            align: 'center',
            color: '#fff',
          },
          hr: {
            width: '100%',
            borderColor: 'rgba(255,255,255,0.2)',
            borderWidth: 0.5,
            height: 0,
            lineHeight: 10,
          },
        },
      },
    };
  }
}
