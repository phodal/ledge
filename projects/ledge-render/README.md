# Ledge Framework Render

> Ledge Framework Render goal is build pure angular's markdown render, it can convert markdown to chart, graph, customize-table & make it extendable.

homepage: [https://github.com/phodal/ledge/tree/master/projects/ledge-render](https://github.com/phodal/ledge/tree/master/projects/ledge-render)

demo page: [https://devops.phodal.com/](https://devops.phodal.com/)

## Usage

1.install: `yarn add @ledge-framework/render`
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

### Develop in Ledge website project

Use [yarn link](https://classic.yarnpkg.com/en/docs/cli/link/) to avoid reinstalling the library on every build.

1. `cd ./dist/ledge-render`
2. `yarn link`
3. in root dir, run `yarn link "@ledge-framework/render"`, it will use `./dist/ledge-render` instead.
4. `yarn build ledge-render --watch`
5. `yarn start`

### Develop in CodeSandbox

[![Edit @ledge-framework/render](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/ledge-frameworkrender-349x9?fontsize=14&hidenavigation=1&theme=dark)

### Add new markdown syntax

1. design new markdown code syntax
2. add type to `handleCode` in `ledge-render.component.ts`
3. use `ng g c` to generate new component
4. link to new component

### Ledge extend code syntax

````
```process-step
 - step1
   - demo
   - kanban
```
````

- Chart
  - echarts. Echarts chart.
  - chart. Echarts bar chart.
  - mindmap. Markdown List to mindmap.
  - radar. Markdown List to radar chart.
  - tech radar. Markdown list to tech radar chart.
  - pie。Pie chart
  - quadrant。quadrant chart
  - pyramid。pyramid chart
- graphviz。dot to graph
- process visualization
  - process-table。process chart
  - process-step。process chart 2
  - process-card。card process chart
  - dev-process。process with logo
  - step-line。title only line chart
  - table-step。with arrow table chart
- checklist。checklists
- mermaid。use [mermaid](https://mermaid-js.github.io/mermaid/) as visual tools
- toolset。use toolset components to extends
  - slider
  - line-chart
- pipeline。ci pipeline
- maturity。check, rating with radrar for maturity

### 权衡滑块示例

````
```toolset
 - 用户体验
 - 时间
 - 成本
 - 安全
 - 范围

config: {"type": "slider"}
```
````

## Roadmap

Todo:

- plugable
  - expose API

## LICENSE

@ 2020 [LiuuY](https://github.com/LiuuY) && [Phodal Huang](https://github.com/phodal). This code is distributed under the MPL license. See `LICENSE` in this directory.
