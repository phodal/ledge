const toolbox = {
  feature: {
    saveAsImage: {},
  },
};

function buildRadarChartOption(data) {
  let indicator: any[] = data.children;

  let legend: any[] = [data.name];
  if (data.config && data.config.legend) {
    legend = data.config.legend;
  }

  function buildSeries(series: any[], valuesSplit: string[]) {
    // tslint:disable-next-line:prefer-for-of
    for (let j = 0; j < legend.length; j++) {
      if (!series[j]) {
        series[j] = {
          name: '',
          value: [],
        };
      }

      series[j].name = legend[j];
      if (valuesSplit[j]) {
        series[j].value.push(valuesSplit[j]);
      }
    }
  }

  function buildSeriesData() {
    // tslint:disable-next-line:no-shadowed-variable
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
        buildSeries(seriesData, valuesSplit);
      }
    }
    return seriesData;
  }

  const seriesData = buildSeriesData();

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

const ChartOptions = {
  buildRadarChartOption,
};

export default ChartOptions;
