export interface ChartData {
  name: string;
  value: string | number;
  itemStyle: any;
}

export interface BarChart {
  xAxis: ChartData[];
  yAxis: ChartData[][];
}

export interface ReporterChartModel {
  title: string;
  barChart?: BarChart;
}
