const { Sitemap } = require('@gammastream/scully-plugin-sitemap');
const { registerPlugin } = require('@scullyio/scully');

const defaultPostRenderers = [Sitemap];

const sitemapOptions = {
  urlPrefix: 'https://devops.phodal.com/',
  sitemapFilename: 'sitemap.xml',
  changeFreq: 'weekly',
  priority: [
    '1.0',
    '0.9',
    '0.8',
    '0.7',
    '0.6',
    '0.5',
    '0.4',
    '0.3',
    '0.2',
    '0.1',
    '0.0',
  ],
  ignoredRoutes: ['/404'],
};

function casePlugin(route, config) {
  return Promise.resolve([
    { route: '/case-study/meituan' },
    { route: '/case-study/cloudbase' },
    { route: '/case-study/ledge' },
    { route: '/case-study/tw-banks' },
    { route: '/case-study/daocloud' },
    { route: '/case-study/cmb' },
    { route: '/case-study/hp' },
    { route: '/case-study/etsy' },
    { route: '/case-study/china-bank' },
    { route: '/case-study/xuecheng' },
    { route: '/case-study/nonghang' },
    { route: '/case-study/huawei' },
    { route: '/case-study/baidu' },
    { route: '/case-study/tencent' },
    { route: '/case-study/bocloud' },
    { route: '/case-study/alibaba' },
    { route: '/case-study/atlassian' },
    { route: '/case-study/zhengcaiyun' },
    { route: '/case-study/dasouche' },
    { route: '/case-study/xiaomi' },
    { route: '/case-study/weibo' },
    { route: '/case-study/youku' },
    { route: '/case-study/bilibili' },
  ]);
}

function solutionPlugin(route, config) {
  return Promise.resolve([
    { route: '/solution/coding' },
    { route: '/solution/cloudbase' },
    { route: '/solution/worktile' },
    { route: '/solution/firim' },
    { route: '/solution/zentao' },
  ]);
}

function thinkTankPlugin(route, config) {
  return Promise.resolve([
    { route: '/think-tank/qa' },
    { route: '/think-tank/ba' },
    { route: '/think-tank/ops' },
    { route: '/think-tank/mobile-android' },
    { route: '/think-tank/frontend' },
    { route: '/think-tank/backend' },
    { route: '/think-tank/microservices' },
    { route: '/think-tank/refactoring' },
  ]);
}

function checklistsPlugin(route, config) {
  return Promise.resolve([
    { route: '/checklists/new-project' },
    { route: '/checklists/agile-practise' },
    { route: '/checklists/azure-devops' },
    { route: '/checklists/aws-devops' },
    { route: '/checklists/devsecops' },
    { route: '/checklists/xp-practise' },
    { route: '/checklists/code-review' },
    { route: '/checklists/frontend' },
    { route: '/checklists/nodejs-practices' },
    { route: '/checklists/api-security' },
    { route: '/checklists/microservices' },
    { route: '/checklists/self-org' },
    { route: '/checklists/semat-requirements' },
  ]);
}

function practisePlugin(route, config) {
  return Promise.resolve([
    { route: '/practise/agile-practise' },
    { route: '/practise/devops-platform' },
    { route: '/practise/devops-practise' },
    { route: '/practise/test-practise' },
    { route: '/practise/frontend-devops-practise' },
    { route: '/practise/devsecops-practise' },
    { route: '/practise/ci-practise' },
  ]);
}

function reportPlugin(route, config) {
  return Promise.resolve([
    { route: '/report/2019' },
    { route: '/report/2020' },
  ]);
}

function maturiyPlugin(route, config) {
  return Promise.resolve([
    { route: '/maturity/devops' },
    { route: '/maturity/amm' },
    { route: '/maturity/arch' },
    { route: '/maturity/owasp' },
    { route: '/maturity/msmm' },
    { route: '/maturity/smmm' },
  ]);
}

function skilltreePlugin(route, config) {
  return Promise.resolve([
    { route: '/skilltree/devops-skilltree' },
    { route: '/skilltree/arch-skilltree' },
    { route: '/skilltree/frontend-skilltree' },
    { route: '/skilltree/backend-skilltree' },
  ]);
}

const validator = async (conf) => [];
registerPlugin('router', 'case', casePlugin, validator);
registerPlugin('router', 'solution', solutionPlugin, validator);
registerPlugin('router', 'tank', thinkTankPlugin, validator);
registerPlugin('router', 'checklists', checklistsPlugin, validator);
registerPlugin('router', 'practise', practisePlugin, validator);
registerPlugin('router', 'report', reportPlugin, validator);
registerPlugin('router', 'maturity', maturiyPlugin, validator);
registerPlugin('router', 'skilltree', skilltreePlugin, validator);

exports.config = {
  projectRoot: './src',
  projectName: 'ledge',
  outDir: './dist/static',
  puppeteerLaunchOptions: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      width: 1440,
      height: 1080,
    },
  },
  sitemapOptions,
  defaultPostRenderers,
  routes: {
    '/case-study/:case': {
      type: 'case',
    },
    '/solution/:solution': {
      type: 'solution',
    },
    '/think-tank/:tank': {
      type: 'tank',
    },
    '/checklists/:name': {
      type: 'checklists',
    },
    '/practise/:practise': {
      type: 'practise',
    },
    '/report/:year': {
      type: 'practise',
    },
    '/maturity/:name': {
      type: 'maturity',
    },
    '/skilltree/:skilltree': {
      type: 'skilltree',
    },
  },
};
