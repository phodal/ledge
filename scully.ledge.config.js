const { RouteTypes } = require('@scullyio/scully');
const { Sitemap } = require('@gammastream/scully-plugin-sitemap');

const defaultPostRenderers = [Sitemap];

const sitemapOptions = {
  urlPrefix: 'https://devops.phodal.com/',
  sitemapFilename: 'sitemap.xml',
  changeFreq: 'hourly',
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

exports.config = {
  projectRoot: './src',
  projectName: 'ledge',
  outDir: './dist/static',
  sitemapOptions,
  defaultPostRenderers,
  routes: {},
};
