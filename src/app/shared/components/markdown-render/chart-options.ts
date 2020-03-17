const toolbox = {
  feature: {
    dataView: {readOnly: false},
    restore: {},
    saveAsImage: {}
  }
};

function buildTreeOption(data) {
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
        top: '12%',
        left: '20%',
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

function buildRadarChartOption(data) {
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
      indicator: data.children
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [],
          name: data.name
        }
      ]
    }]
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

function buildQuadrantChartOption(data) {
  return {
    series: [{
      type: 'treemap',
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
          color: ['#942e38', '#aaa', '#269f3c', '#DDD'],
          colorMappingBy: 'id',
          itemStyle: {
            gapWidth: 1
          }
        }
      ],
      data: [{
        name: 'nodeA',            // First tree
        value: 10,
        children: [{
          name: 'nodeAa',       // First leaf of first tree
          value: 5
        }, {
          name: 'nodeAb',       // Second leaf of first tree
          value: 5
        }]
      }, {
        name: 'nodeB',            // Second tree
        value: 10,
        children: [{
          name: 'nodeBa',       // Son of first tree
          value: 5
        }, {
          name: 'nodeBa',       // Son of first tree
          value: 5
        }]
      }]
    }]
  };
}

const ChartOptions = {
  buildTreeOption,
  buildRadarChartOption,
  buildPyramidChartOption,
  buildQuadrantChartOption
};

export default ChartOptions;
