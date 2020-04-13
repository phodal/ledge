export interface Solution {
  displayName: string;
  source: string;
  default?: boolean;
}

export type Solutions = Array<Solution>;

export const solutions: Solutions = [
  { displayName: 'Coding', source: 'coding' },
  { displayName: '云开发（腾讯云）', source: 'cloudbase' },
];
