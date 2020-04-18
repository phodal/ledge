export interface Thinktank {
  displayName: string;
  source: string;
  default?: boolean;
}

export type Thinktanks = Array<Thinktank>;

// todo: 优先级根据内容的质量重新排序。现在的是后来的在后面  + 内容多的在前面，随机组合
export const thinktanks: Thinktanks = [
  { displayName: 'BA', source: 'ba', default: true },
  { displayName: 'QA', source: 'qa', default: true },
  { displayName: 'Android', source: 'mobile-android', default: true },
  { displayName: '前端', source: 'frontend', default: true },
];
