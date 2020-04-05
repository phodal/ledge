# Ledge Framework Render

> Ledge Framework Render goal is build pure angular's markdown render, it can convert markdown to chart, graph, customize-table & make it extendable.

homepage: [https://github.com/phodal/ledge/tree/master/projects/ledge-render](https://github.com/phodal/ledge/tree/master/projects/ledge-render)

demo page: [https://devops.phodal.com/](https://devops.phodal.com/)

## Usage

1.install: `yarn add @ledge-framework/ledge`
2.import module

```
import { LedgeRenderModule } from '@ledge-framework/render';

@NgModule({
  imports: [
    ...
    LedgeRenderModule,
  ]
  ...
})
```

3.use it

```
<ledge-render [content]="content"></ledge-render>
```

## Development

Use (yarn link)[https://classic.yarnpkg.com/en/docs/cli/link/] to avoid reinstalling the library on every build.

1. `cd ./dist/ledge-render`
2. `yarn link`
3. in root dir, run `yarn link "@ledge-framework/render"`, it will use `./dist/ledge-render` instead.
4. `yarn build ledge-render --watch`
5. `yarn start`

## Roadmap

Todo:

- plugable
  - expose API

## LICENSE

@ 2020 [LiuuY](https://github.com/LiuuY) && [Phodal Huang](https://github.com/phodal). This code is distributed under the MPL license. See `LICENSE` in this directory.
