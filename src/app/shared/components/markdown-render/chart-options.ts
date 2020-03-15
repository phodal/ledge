function buildTreeOption(data) {
  return {
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
      formatter: '{a} <br/>{b} : {c}%'
    },
    toolbox: {
      feature: {
        dataView: {readOnly: false},
        restore: {},
        saveAsImage: {}
      }
    },

    series: [
      {
        name: '漏斗图',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
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
            fontSize: 20
          }
        },
        data: [
          {value: 60, name: '访问'},
          {value: 40, name: '咨询'},
          {value: 20, name: '订单'},
        ]
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
