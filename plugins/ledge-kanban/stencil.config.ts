import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'ledge-kanban',
  taskQueue: 'async',
  bundles: [
    { components: ['ledge-kanban', 'oce-bin', 'oce-card', 'oce-kanban', 'oce-modal'] }
  ],
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader'
    },
    {
      type: 'docs-readme'
    },
    {
      type: 'www',
      serviceWorker: null // disable service workers
    }
  ]
};
