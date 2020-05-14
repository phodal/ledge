import { DocRoute } from '@ledge-framework/view/lib/ledge-multiple-docs/doc-route.model';

export type Solutions = Array<DocRoute>;

export const solutions: Solutions = [
  { displayName: 'Coding', source: 'coding' },
  { displayName: '云开发（腾讯云）', source: 'cloudbase' },
  { displayName: 'fir.im', source: 'firim' },
  { displayName: '禅道', source: 'zentao' },
  { displayName: 'Worktile', source: 'worktile' },
];
