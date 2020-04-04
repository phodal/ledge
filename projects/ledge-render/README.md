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

## Roadmap

Todo:

- plugable
  - expose API

## LICENSE

@ 2020 [LiuuY](https://github.com/LiuuY) && [Phodal Huang](https://github.com/phodal). This code is distributed under the MPL license. See `LICENSE` in this directory.
