# Ledge 知识和工具平台

![Badge](https://img.shields.io/badge/Poweredby-%40ledge--framework%2Fengine-brightgreen)
![CI](https://github.com/phodal/ledge/workflows/CI/badge.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/64e2ddc705fbeba4435e/maintainability)](https://codeclimate.com/github/phodal/ledge/maintainability)
[![codecov](https://codecov.io/gh/phodal/ledge/branch/master/graph/badge.svg)](https://codecov.io/gh/phodal/ledge)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fphodal%2Fledge.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fphodal%2Fledge?ref=badge_shield)

[![CODING 持续集成](https://coding-public.coding.net/badges/ledge/job/236475/master/build.svg)](https://coding-public.coding.net/p/ledge/d/ledge/git)

<p align="center"> 
  <img src="src/assets/images/logo.svg" width="288" height="74">
</p>

在线使用：[https://devops.phodal.com/](https://devops.phodal.com/)

Gitee (MVP) : https://gitee.com/phodal/ledge

国内服务器：

1. CODING（每小时同步）：[https://ledge.devops.host/](https://ledge.devops.host/)
2. 腾讯云-云开发服务器（不定期同步）： [https://ledge.wdsm.io/](https://ledge.wdsm.io/)

Ledge （from Know-Ledge，意指承载物）知识和工具平台，是我们基于在 ThoughtWorks 进行的一系列 DevOps 实践、敏捷实践、软件开发与测试、精益实践提炼出来的知识体系。它包含了各种最佳实践、原则与模式、实施手册、度量、工具，用于帮助您的企业在数字化时代更好地前进，还有 DevOps 转型。

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

（PS：如果群满了，请添加我的微信 `phodal02` ）

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

### 文档规范

[Chinese Copywriting Guidelines](https://sparanoid.com/note/chinese-copywriting-guidelines/)

### Markdown 扩展语法

syntax see in [ledge render](https://github.com/ledge-framework/engine/tree/master/projects/%40ledge-framework/render)

example see in [Ledge Editor](https://devops.phodal.com/helper)

## Todo

### 1.0 It works

see in [Roadmap 1.0](https://github.com/phodal/ledge/issues/30)

### 2.0 Toolset

see in [Roadmap 2.0](https://github.com/phodal/ledge/issues/183)

core:

- [ ] Ledge Framework
- [ ] workflow design: https://github.com/elsa-workflows/elsa-designer
- [ ] Interactive DevOps Design
  - [ ] Fluent DevOps
  - [ ] [Health Radar](https://www.scaledagileframework.com/blog/assess-your-devops-health-with-the-safe-devops-radar/)

### 3.0 Ledge

- [ ] Ledge as Code

## Inspired by

Fluency model:

- [http://agilefluency.org/](http://agilefluency.org/)

and:

- [https://www.nexthink.com/periodic-table/](https://www.nexthink.com/periodic-table/)

others see in the Code.

## License

- tree based on: [https://bl.ocks.org/d3noob/1a96af738c89b88723eb63456beb6510](https://bl.ocks.org/d3noob/1a96af738c89b88723eb63456beb6510))
- Periodic based on:[https://stackblitz.com/edit/ng-periodic-table](https://stackblitz.com/edit/ng-periodic-table)
- Tech Radar based on: [https://cofinpro.github.io/Tech-Radar/](https://cofinpro.github.io/Tech-Radar/)
- Kanban based on: https://github.com/Devstackr/kanban-angular-layout

[![Phodal's Idea](http://brand.phodal.com/shields/idea-small.svg)](http://ideas.phodal.com/)

@ 2020 A [Phodal Huang](https://www.phodal.com)'s [Idea](http://github.com/phodal/ideas). This code is distributed under the MPL license. See `LICENSE` in this directory.

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fphodal%2Fledge.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fphodal%2Fledge?ref=badge_large)
