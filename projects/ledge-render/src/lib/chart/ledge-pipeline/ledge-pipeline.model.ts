export interface PipelineConfig {
  connectionStrokeWidth: number;
  stateStrokeWidth: number;
  stateRadius: number;
  stageSpace: number;
  stageLabelHeight: number;
  stageLabelSize: string;
  jobHeight: number;
  jobLabelSize: string;
  startNodeRadius: number;
  startNodeSpace: number;
  endNodeRadius: number;
  endNodeSpace: number;
}

export interface Stage {
  label: string;
  jobs: Job[];
}

export interface Job {
  label: string;
  state: JobState;
}


export enum JobState {
  UNTOUCHED = 'untouched',
  PROCESSING = 'processing',
  CURRENT = 'current',
  SUCCESS = 'success',
  ERROR = 'error',
  PENDING = 'pending',
}

export enum Color {
  GREEN = '#4A9900',
  RED = '#C4000A',
  GRAY = '#949393',
  WHITE = '#FFFFFF',
}

export enum PolygonPoints {
  checkMark = '-2.00 2.80 -4.80 0.00 -5.73 0.933 -2.00 4.67 6.00 -3.33 5.07 -4.27',
  crossMark = '4.67 -3.73 3.73 -4.67 0 -0.94 -3.73 -4.67 -4.67 -3.73 -0.94 0 -4.67 3.73 -3.73 4.67 0 0.94 3.73 4.67 4.67 3.73 0.94 0',
}

export const defaultPipelineConfig = {
  connectionStrokeWidth: 4,
  stateStrokeWidth: 4,
  stateRadius: 16,
  stageSpace: 60,
  stageLabelHeight: 30,
  stageLabelSize: '16px',
  jobHeight: 60,
  jobLabelSize: '12px',
  startNodeRadius: 12,
  startNodeSpace: 40,
  endNodeRadius: 12,
  endNodeSpace: 40,
};