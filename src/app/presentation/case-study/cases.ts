export interface Case {
  displayName: string;
  source: string;
  default?: boolean;
}

export type Cases = Array<Case>;

export const cases: Cases = [
  { displayName: '美团', source: 'meituan', default: true },
  { displayName: 'Ledge', source: 'ledge' },
  { displayName: '大型银行转型', source: 'tw-banks' },
  { displayName: 'DaoCloud', source: 'daocloud' },
  { displayName: '招商银行', source: 'cmb' },
  { displayName: 'HP', source: 'hp' },
  { displayName: 'Etsy', source: 'etsy' },
  { displayName: '中国银行', source: 'china-bank' },
  { displayName: '携程', source: 'xuecheng' },
  { displayName: '农业银行', source: 'nonghang' },
  { displayName: '华为', source: 'huawei' },
  { displayName: '百度', source: 'baidu' },
  { displayName: '腾讯', source: 'tencent' },
  { displayName: '博云', source: 'bocloud' },
  { displayName: '阿里巴巴', source: 'alibaba' },
  { displayName: 'Atlassian', source: 'atlassian' },
  { displayName: '政采云', source: 'zhengcaiyun' },
  { displayName: '大搜车', source: 'dasouche' },
  { displayName: '小米', source: 'xiaomi' },
  { displayName: '微博', source: 'weibo' },
  { displayName: '优酷', source: 'youku' },
  { displayName: 'Bilibili', source: 'bilibili' },
];
