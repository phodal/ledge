export interface Practise {
  displayName: string;
  source: string;
  default?: boolean;
}

export type Practises = Array<Practise>;

export const practises: Practises = [
  { displayName: 'DevOps 平台', source: 'devops-platform' },
  { displayName: 'DevOps 实践', source: 'devops-practise' },
  { displayName: '技术实践', source: 'tech-practise' },
  { displayName: '敏捷实践', source: 'agile-practise' },
  { displayName: '前端 DevOps 实践', source: 'frontend-devops-practise' },
  { displayName: '测试实践', source: 'test-practise', default: true },
  { displayName: 'DevSecOps 实践', source: 'devsecops-practise' },
  { displayName: '持续集成', source: 'ci-practise' },
];
