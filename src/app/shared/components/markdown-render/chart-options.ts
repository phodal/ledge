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

const ChartOptions = {
  buildTreeOption,
  buildRadarChartOption,
};

export default ChartOptions;
