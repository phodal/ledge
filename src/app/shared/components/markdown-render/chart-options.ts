import * as echarts from 'echarts';

const toolbox = {
  feature: {
    dataView: {readOnly: false},
    restore: {},
    saveAsImage: {}
  }
};

function buidMindmapOption(data) {
  return {
    toolbox,
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
        top: '8%',
        left: '10%',
        bottom: '8%',
        right: '20%',

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

function buildRadarChartOption(data) {
  const value = [];
  let indicator: any[] = data.children;
  const firstName = data.children[0].name;
  if (firstName.includes(': ') || firstName.includes('： ')) {
    indicator = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < data.children.length; i++) {
      const child = data.children[i];
      const split = child.name.split(': ');
      indicator.push({
        name: split[0],
        max: 5
      });
      value.push(parseInt(split[1], 10));
    }
  }

  return {
    toolbox,
    tooltip: {},
    legend: {
      data: [data.name]
    },
    radar: {
      name: {
        textStyle: {
          color: '#000',
          borderRadius: 3,
          padding: [3, 5],
          fontSize: 14,
        }
      },
      indicator
    },
    series: [{type: 'radar', data: [{value, name: data.name}]}]
  };
}

function buildPyramidChartOption(data) {
  const seriesData = {
    name: data.name,
    type: 'funnel',
    sort: 'ascending',
    label: {
      show: true,
      position: 'inside',
      fontSize: 14
    },
    labelLine: {
      length: 10,
      lineStyle: {
        width: 1,
        type: 'solid'
      }
    },
    itemStyle: {
      borderColor: '#fff',
      borderWidth: 1
    },
    emphasis: {
      label: {
        fontSize: 24
      }
    },
    data: data.children
  };
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

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}'
    },
    toolbox,
    series
  };
}

// tslint:disable-next-line:no-shadowed-variable
function buildConfig(data, graphic: any[]) {
  if (data.config && data.config.left) {
    const keys = Object.keys(data.config);
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const graphConfig: any = {
        type: 'group',
        bounding: 'all',
        children: [{
          type: 'text',
          style: {fill: '#000', text: '', fontSize: 14}
        }]
      };

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

      graphic.push(graphConfig);
    }
  }
}

function buildQuadrantChartOption(data) {
  if (!data.children) {
    return;
  }
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < data.children.length; i++) {
    data.children[i].value = 25;
  }
  const quadData = [{
    name: 'left',
    value: 50,
    children: [
      data.children[0],
      data.children[1]
    ]
  }, {
    name: 'right',
    value: 50,
    children: [
      data.children[2],
      data.children[3]
    ]
  }];

  // tslint:disable-next-line:no-shadowed-variable
  const graphic = [];
  buildConfig(data, graphic);

  console.log(graphic);

  return {
    title: {
      text: data.name,
      left: 'center'
    },
    graphic,
    series: [{
      label: {
        normal: {
          position: 'insideTopLeft',
          formatter: params => {
            const children: any[] = params.data.children;
            const arr = [
              '{name|' + params.name + '}',
              '{hr|}',
            ];

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
              color: 'white'
            },
            name: {
              fontSize: 20,
              align: 'center',
              color: '#fff'
            },
            hr: {
              width: '100%',
              borderColor: 'rgba(255,255,255,0.2)',
              borderWidth: 0.5,
              height: 0,
              lineHeight: 10
            }
          }
        }
      },
      type: 'treemap',
      breadcrumb: {
        show: false
      },
      visualMin: 0,
      visualMax: 100,
      visualDimension: 3,
      levels: [
        {
          itemStyle: {
            borderWidth: 3,
            borderColor: '#333',
            gapWidth: 3
          }
        },
        {
          color: ['#666666', '#7f195e', '#09c95e', '#008988'],
          colorMappingBy: 'id',
          itemStyle: {
            gapWidth: 1
          }
        }
      ],
      data: quadData,
    }]
  };
}

const ChartOptions = {
  buidMindmapOption,
  buildRadarChartOption,
  buildPyramidChartOption,
  buildQuadrantChartOption
};

export default ChartOptions;
