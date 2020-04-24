# Ledge 知识和工具平台

<p align="center"> 
  <img src="src/assets/images/logo.svg" width="288" height="74">
</p>

在线使用：[https://devops.phodal.com/](https://devops.phodal.com/)

国内服务器（不定期同步）：

1. 腾讯云-云开发服务器： [https://ledge.wdsm.io/](https://ledge.wdsm.io/)

Ledge （from Know-Ledge，意指承载物）知识和工具平台，是我们基于在 ThoughtWorks 进行的一系列 DevOps 实践、敏捷实践、软件开发与测试、精益实践提炼出来的知识体系。它包含了各种最佳实践、原则与模式、实施手册、度量、工具，用于帮助您的企业在数字化时代更好地前进，还有 DevOps 转型。

![CI](https://github.com/phodal/ledge/workflows/CI/badge.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/64e2ddc705fbeba4435e/maintainability)](https://codeclimate.com/github/phodal/ledge/maintainability)
[![codecov](https://codecov.io/gh/phodal/ledge/branch/master/graph/badge.svg)](https://codecov.io/gh/phodal/ledge)

![Screenshots](docs/images/ledge-ss.png 'Ledge 首页截图')

您可以在这个平台上看到：

- **工具元素周期表**。帮助您进行数字化时代的 DevOps 工具选型。
- **DevOps 设计工具**。帮助您设计组织内的 DevOps 流程，涵盖了流程、人、工具、制品等等。
- **案例学习**。从社区的知识库中，我们总结了传统企业走向 DevOps 的经验，并浓缩到易于使用的内容和材料中。
- **最佳实践**。我们从海量的 DevOps 内容中，提炼出了一系列的最佳实践，以更好地帮助企业进行 DevOps 实践。
- **模式与原则**。基于我们的实践，我们提炼了位于它背后的模式与原则，帮助个人和组织更好地了解 DevOps 文化。
- **实施手册**。只凭实践与原则，无法让中小型 IT 团队进行 DevOps 转型，所以我们准备了详实的实施手册，以帮助您一步步前进。
- **度量**。KPI - 度量、度量 - KPI、KPI - 度量，帮助您更好地度量 DevOps 转型情况。
- **报告**。我们尝试从丰富地 DevOps 报告中，提炼出有用的实践和工具。
- **Mobile DevOps**。我们相信移动应用的 DevOps 改进，才是大多数公司的挑战。
- **工具**。工具，工具，工具是最好的生产力，工具比人的记忆力更加可靠。
- **解决方案**。即某一 DevOps 厂商的解决方案。（不收费，为了 Ledge 项目的可持续性，仅开放给将 Ledge 列为合作伙伴的厂商）

## Contribution

从互联网的海量知识提炼内容，并不是一件简单的事情。取其精华，去其糟粕，是我们一直在做的事情，欢迎加入我们：

![Wechat Group](docs/images/wechat-group.jpg)

（PS：如果群满了，请添加我的微信 `growth-ren` ）

欢迎您在这个项目的 Issue 中留下您的宝贵意见，以帮助其他/她人更好地学习 DevOps 相关的知识。它可以是：

- 修改手误的文本
- 针对不合时宜内容的评论
- 更好地 DevOps 实践
- 缺失的内容引用
- 相关的工具推荐
- 成熟的 DevOps 平台
- ……

您可以从这里修改内容：[src/assets/docs](src/assets/docs) 。

## Development

架构：

- [文档代码化](https://devops.phodal.com/practise#docs-like-code)。我们采用了 Markdown like code 的理念，来生成一系列的内容和图表等。
- 持续部署。基于 GitHub Pages 和 GitHub Actions，我们构建了一套自动化部署系统，提交即部署。
- Static Site Generator.
- ~微前端。我们通过 Web Components 来构建项目的微前端体系~
- ~WebComponents~

### Setup

1. install

```
yarn install
```

2. run

```
yarn start
```

### Plugins

todo: fix Angular elements bug

- https://github.com/phodal/devops-path
- https://github.com/phodal/devops-periodic

## 编写案例

测试语法：[https://devops.phodal.com/helper](https://devops.phodal.com/helper)

### Markdown 扩展语法

通过语法高亮参数来扩展能力，如

````
```process-step
 - 第一阶段闭环：开发测试融合
   - 看板
   - 站会
```
````

- 图表
  - echarts。直接渲染 Echarts 图表
  - chart。 Echarts 的 bar 图表
  - mindmap。Markdown List 转为思维导图
  - radar。Markdown List 转为雷达图
  - pie。饼图
  - quadrant。四象限图
  - pyramid。金字塔图形
- graphviz。使用 Dot 渲染图片
- 流程可视化
  - process-table。带流程的图表
  - process-step。带流程的图表 2
  - process-card。卡片式流程
  - dev-process。工具 Logo 可视化
  - step-line。 多行带箭头 step 流程
  - table-step。 多行带箭头卡式流程图表
- checklist。检查清单
- mermaid。使用 [mermaid](https://mermaid-js.github.io/mermaid/) 可视化
- <del>webcomponents。调用 WebComponents 组件</del>
- 工具
  - toolset。调用 Toolset 相关的组件
    - slider。权衡滑块
    - line-chart。表图

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

## Todo

### 1.0 It works

- [x] 更多的度量内容
  - [x] 监控等
- [x] 更多的 DevOps 报告
- [ ] 单元测试
  - [x] 考虑一下 E2E 测试方案
- [x] 完善 toolset
  - [x] slider
  - [x] line-chart
- [x] 重构 markdown render
- [x] I18N support

### 2.0 Toolset

- [ ] Ledge Framework
- [ ] workflow design: https://github.com/elsa-workflows/elsa-designer
- [ ] Interactive DevOps Design
  - [ ] Fluent DevOps
  - [ ] [Health Radar](https://www.scaledagileframework.com/blog/assess-your-devops-health-with-the-safe-devops-radar/)
- [ ] BizDevOps
- [ ] I18N
  - [ ] EN

### 3.0 Ledge

- [ ] Ledge as Code

## Inspired by

Fluency model:

- [http://agilefluency.org/](http://agilefluency.org/)

and:

- [https://www.nexthink.com/periodic-table/](https://www.nexthink.com/periodic-table/)

others see in the Code.

## License

- Periodic based on:[https://stackblitz.com/edit/ng-periodic-table](https://stackblitz.com/edit/ng-periodic-table)
- Tech Radar based on: [https://cofinpro.github.io/Tech-Radar/](https://cofinpro.github.io/Tech-Radar/)
- Kanban based on: https://github.com/Devstackr/kanban-angular-layout

[![Phodal's Idea](http://brand.phodal.com/shields/idea-small.svg)](http://ideas.phodal.com/)

@ 2020 A [Phodal Huang](https://www.phodal.com)'s [Idea](http://github.com/phodal/ideas). This code is distributed under the MPL license. See `LICENSE` in this directory.
