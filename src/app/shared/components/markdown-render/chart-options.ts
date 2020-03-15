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
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}'
    },
    toolbox,
    series: [
      {
        name: data.name,
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '90%',
        minSize: '0%',
        maxSize: '100%',
        sort: 'ascending',
        gap: 2,
        label: {
          show: true,
          position: 'inside'
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
      }
    ]
  };
}

const ChartOptions = {
  buildTreeOption,
  buildRadarChartOption,
  buildPyramidChartOption
};

export default ChartOptions;
