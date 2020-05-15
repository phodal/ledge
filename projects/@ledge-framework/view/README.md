# Ledge Framework Render

> Ledge Framework Render goal is build pure angular's markdown render, it can convert markdown to chart, graph, customize-table & make it extendable.

homepage: [https://github.com/phodal/ledge/tree/master/projects/ledge-render](https://github.com/phodal/ledge/tree/master/projects/ledge-render)

demo page: [https://devops.phodal.com/](https://devops.phodal.com/)

## Usage

1.install: `yarn add @ledge-framework/view`
2.import module

```
import { LedgeViewModule } from '@ledge-framework/view';

@NgModule({
  imports: [
    ...
    LedgeViewModule,
  ]
  ...
})
```

3.

use single render:

```html
<ledge-markdown-render sourceDir="{{urlPrefix}}/{{source}}.md" [data]="content">
</ledge-markdown-render>
```

use multiple docs render

```html
<ledge-multiple-docs
  [items]="items"
  [currentUrl]="currentUrl"
  [urlPrefix]="urlPrefix"
  [source]="currentSource"
>
</ledge-multiple-docs>
```

## Development

### Develop in Ledge website project

Use [yarn link](https://classic.yarnpkg.com/en/docs/cli/link/) to avoid reinstalling the library on every build.

1. `cd ./dist/ledge-view`
2. `yarn link`
3. in root dir, run `yarn link "@ledge-framework/view"`, it will use `./dist/ledge-render` instead.
4. `yarn build ledge-render --watch`
5. `yarn start`

## LICENSE

@ 2020 [LiuuY](https://github.com/LiuuY) && [Phodal Huang](https://github.com/phodal). This code is distributed under the MPL license. See `LICENSE` in this directory.
