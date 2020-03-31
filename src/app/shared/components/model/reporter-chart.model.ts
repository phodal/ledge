export interface ChartData {
  name: string;
  value: string | number;
  itemStyle: any;
}

export interface ReporterChartModel {
  title: string;
  barChart?: {
    xData: ChartData[],
    yData: ChartData[][]
  };
}
