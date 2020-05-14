import { DocRoute } from '@ledge-framework/view/lib/ledge-multiple-docs/doc-route.model';

export type Cases = Array<DocRoute>;

// todo: 优先级根据内容的质量重新排序。现在的是后来的在后面  + 内容多的在前面，随机组合
export const cases: Cases = [
  { displayName: 'Ledge', source: 'ledge', default: true },
  { displayName: '腾讯云-云开发', source: 'cloudbase' },
  { displayName: '携程', source: 'xuecheng' },
  { displayName: '小米', source: 'xiaomi' },
  { displayName: '美团', source: 'meituan' },
  { displayName: '大型银行转型', source: 'tw-banks' },
  { displayName: '招商银行', source: 'cmb' },
  { displayName: 'Atlassian', source: 'atlassian' },
  { displayName: 'Netflix', source: 'netflix' },
  { displayName: 'HP', source: 'hp' },
  { displayName: 'Etsy', source: 'etsy' },
  { displayName: 'DaoCloud', source: 'daocloud' },
  { displayName: '中国银行', source: 'china-bank' },
  { displayName: '农业银行', source: 'nonghang' },
  { displayName: '华为', source: 'huawei' },
  { displayName: '百度', source: 'baidu' },
  { displayName: '腾讯', source: 'tencent' },
  { displayName: '博云', source: 'bocloud' },
  { displayName: '阿里巴巴', source: 'alibaba' },
  { displayName: '政采云', source: 'zhengcaiyun' },
  { displayName: '大搜车', source: 'dasouche' },
  { displayName: '微博', source: 'weibo' },
  { displayName: '优酷', source: 'youku' },
  { displayName: 'Bilibili', source: 'bilibili' },
];
