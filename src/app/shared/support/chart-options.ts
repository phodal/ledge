const toolbox = {
  feature: {
    saveAsImage: {},
  },
};

function buildMindmapOption(data) {
  let height = '600px';
  const dataStr = JSON.stringify(data);
  if (dataStr.length > 500) {
    height = '720px';
  }

  return {
    toolbox,
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

function buildRadarChartOption(data) {
  let indicator: any[] = data.children;

  let legend: any[] = [data.name];
  if (data.config && data.config.legend) {
    legend = data.config.legend;
  }
  const seriesData = [];

  const firstName = data.children[0].name;
  const hasValue = firstName.includes(': ') || firstName.includes('： ');
  if (hasValue) {
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
      const valuesSplit = values.split(' -> ');
      // tslint:disable-next-line:prefer-for-of
      for (let j = 0; j < legend.length; j++) {
        if (!seriesData[j]) {
          seriesData[j] = {
            name: '',
            value: [],
          };
        }

        seriesData[j].name = legend[j];
        if (valuesSplit[j]) {
          seriesData[j].value.push(valuesSplit[j]);
        }
      }
    }
  }

  return {
    toolbox,
    tooltip: {},
    legend: {
      data: legend,
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
    series: [{ type: 'radar', data: seriesData }],
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
      formatter: '{b}',
    },
    toolbox,
    series,
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
        children: [
          {
            type: 'text',
            style: { fill: '#000', text: '', fontSize: 18 },
          },
        ],
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
  buildConfig(data, graphic);

  return {
    title: {
      text: data.name,
      left: 'center',
    },
    graphic,
    series: [
      {
        roam: false,
        label: {
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
        },
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

const ChartOptions = {
  buildMindmapOption,
  buildRadarChartOption,
  buildPyramidChartOption,
  buildQuadrantChartOption,
};

export default ChartOptions;
