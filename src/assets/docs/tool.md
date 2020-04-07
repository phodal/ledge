# 工具

## 架构

### 权衡滑块

EN：Trade-off Sliders，又名二选一（Choose One Thing）

源自：《架构师修炼之道》

> 与利益相关方讨论任务优先级时，可以让对方做一个极端的选择：如果我们现在只能够做两件事中的一件，那么应该做哪一件？这个方法能够帮助利益相关方在难以取舍时做出选择。

准备事项：对比选项，如质量属性、成本、进度、功能等。

步骤：

1. 说明规则。参与者只能挑选一个选项，但这不意味着接下来只做这一件事，而是借此澄清问题，解决分歧，避免不必要的麻烦。
2. 展示选项。逐一解释每个选项的含义，确保每个人都能理解。
3. 要求参与者挑选一个选项。找出所有参与者都认同的选项，达成共识。
4. 请参与者简要说明选择的理由。讨论往往比最终结果更重要。
5. 就另一组选项重复上述步骤。

对比选项示例

| 对比项                     | 选择结果                                                   |
| -------------------------- | ---------------------------------------------------------- |
| 更高的性能 vs 更高的准确度 | 更高的性能，前提是准确度不能低于一定标准                   |
| 成本 vs 上市时间           | 上市时间，务必在规定时间实现系统功能，哪怕是要背负技术债务 |
| 可用性 vs 安全性           | 安全性，这是最重要的质量属性                               |
| 可用性 vs 成本             | 可用性，为了实现高可用性，对方愿意出资购买冗余设备         |

#### 权衡滑块工具

```toolset
 - 用户体验
 - 时间
 - 成本
 - 安全
 - 范围

config: {"type": "slider"}
```

示例：

![权衡滑块示例](/assets/docs/images/choose-one-thing.png '权衡滑块示例')

### 移情图

源自：《架构师修炼之道》

> 举行头脑风暴，描述某得利益相关方（如客户、用户、维护人员等））的任务、想法、感受，帮助团队换位思考，理解对方的目标。

作用：

- 在写架构描述之前，确定受众的需求
- 判断哪些信息有用，哪些信息可以忽略
- 建立评估准则，用于架构描述的有效性

```quadrant
 - 一位开发人员的移情图
   - 任务
     - 写代码，重构
     - 发布版本
     - 代码评审
   - 口头禅
     - 我不是不同意，我就是喜欢辩论
     - 能实现自动化的最好自动化
     - 我要带彩色输出的控制台
   - 产出
     - 功能测试和单元测试
     - 用于部署 Docker 的容器
     - 类、方法、接口
   - 想法
     - 我讨厌返工
     - 这样做行吗？
     - 这喜欢学习新技术
```

### 干系人地图

EN: Stakeholder Mapping

> 为梳理在项目进程中各个事项的参与方，推进快速组织和避免会议扩大，有必要形成项目的干系人地图。

### 质量属性网络

En： Quality Attribute Web

> 质量属于网络用可视化的方式展示头脑风暴的结果，它可以对利益相关方关注的事项和原始质量属性场景进行提取、分类、完善、排定优先级。它可以用来收集利益相关方的关注事项（记录在便利贴上）

步骤：

1. 展示空白的质量属性网络。
2. 开展头脑刚果，收集利益相关方关注的事项和原始质量属性场景。
3. 到时间后（30 ~ 45 分钟），拍照记录结果。用这些信息创建质量属性场景。

空白的质量属性网络：

```radar
 - 质量属性网络
   - 可靠性
   - 可修改性
   - 安全性
   - 可测试性
   - 性能
   - 可用性
```

示例:

![质量属性网络](/assets/docs/images/quality-attribute-web-diagram.png '质量属性网络示例')

### 因果图

> 鱼骨图又名特性因素图是由日本管理大师石川馨先生所发展出来的，故又名石川图。鱼骨图是一种发现问题“根本原因”的方法，它也可以称之为“因果图”。鱼骨图原本用于质量管理。

步骤：

1. 查找要解决的问题；
2. 把问题写在鱼骨的头上；
3. 召集同事共同讨论问题出现的可能原因，尽可能多地找出问题；
4. 把相同的问题分组，在鱼骨上标出；
5. 根据不同问题征求大家的意见，总结出正确的原因；
6. 拿出任何一个问题，研究为什么会产生这样的问题？
7. 针对问题的答案再问为什么？这样至少深入五个层次（连续问五个问题）；
8. 当深入到第五个层次后，认为无法继续进行时，列出这些问题的原因，而后列出至少 20 个解决方法。

常見的分類为「人机物法环测」，英文简称为 5M1E：

- 人（Man）：和此一制程有关的所有人员。
- 机（机器，Machine）：进行此制程需要的设备，电脑等相关工具。
- 物（物料，Material）：生产成品需要的原材料，零件，纸，笔等物品。
- 法（方法，Method）：制程进行的方式，以及进行时需要的特定需求，像是政策，程序，规定，标准及法规等。
- 环（环境/介质，Environment / Medium）：制程运作时的条件，例如地点，时点，温度，湿度或文化等。
- 测（测量／检查，Measurement/ Inspection）：在此后制作过程所产生，用来检查质量的资料，也包括测量用的仪器。

也有些是用上述的五个 M 再加上以下的三个 M，成为 8M。

- 任务（任务）／环境（Mother nature）：有包括内部（任务）环境或外部（任务）环境。
- 管理（Management）／财力（Money power）
- 维护（维护）

示例：

![因果图示例](/assets/docs/images/typical-Ishikawa-diagram-Invensis.jpg '因果图示例')

### 工作路径

En: Ways of Working

[武汉敏捷 PM Open Day 学习小记](https://www.jianshu.com/p/afac945a1d27)

### Path to Production

Path to Production，来源于精益，旨在通过可视化的方式来展示项目的上线流程，并优化过程中的瓶颈问题。它类似于我们使用 CI（持续集成）时的 Pipeline。传统的 Pipeline 的 gate 可以通过代码定义一些标准，由测试不能挂，测试覆盖率不能低于多少，打包不能失败等等。而这些 Pipeline 则是分别由开发人员、测试人员、运维人员、项目负责人等等来负责把控的。

对应的，在这个过程中：流程（Process）、人（People）、工具（Tooling）、产物（Artifacts） 都是我们的关注点：

- Process，即上线需要多少流程。从提交代码开始，运行持续集成，部署到 Dev 环境等等。
- People，即过程中需要哪些人来参与。如需要开发人员提交代码，需要测试人员进行 QA 环境部署，需要项目经理等高级领导进行上线审批等。
- Tooling，即需要使用哪些工具来完成上线。如托管代码的 Git 服务器，运行构建的持续集成工具，提交上线申请的相关工具等等。
- Artifacts，即过程中产出的产物。如生成的应用包，QA 生成的测试报告等等。

随后，我们从相关的流程中，梳理出每个部分（流程）的持续时间、痛点，来查找优化空间。

《[如何优化上线流程——Path to Production](https://www.phodal.com/blog/tech-lead-tools-path-to-production/)》

示例：

| 活动 | stage 1      | stage 1      | stage 1         | stage 1       | stage 1  | stage 1       | stage 1  | stage 1  | stage 1 |
| ---- | ------------ | ------------ | --------------- | ------------- | -------- | ------------- | -------- | -------- | ------- |
| 流程 | 提交代码     | 运行 CI      | 部署到 Dev 环境 | 运行 E2E 测试 | 手动测试 | 部署到 ST/UAT | 手动测试 | 上线申请 | 上线    |
| 人   | Dev          | Dev          | Dev             | Dev           | Dev      | 项目 QA       | 业务 QA  | 业务 QA  | PM      | Dev |
| 工具 | Git & GitHub | Jenkins      | Jenkins         | Jenkins       | -        | Jenkins       | -        | 邮件     | -       |
| 制品 | 代码         | 持续集成结果 | -               | 测试报告      | 测试报告 | -             | 邮件结果 | -        |         |

### 心流模型

| 挑战 / 能力 | low     | high    |
| ----------- | ------- | ------- |
| low         |         | boredom |
| high        | anxiety | flow    |

```toolset
|  Challenge;Skill/Ability   | low | high |
|-|-|-|
| low  |      | boredom |
| high | anxiety | flow |

config: {"type": "line-chart"}
```

### 架构决策记录

来源：《[架构决策记录](https://www.phodal.com/blog/documenting-architecture-decisions/)》

> 架构决策记录，是一个类似于亚历山大模式（即：设计模式）的短文本文件。（虽然决策本身不一定是模式，但它们分享着力量的特征平衡。）每个记录都描述了一组力量和一个响应这些力量的决策。请注意，决策是这里的核心部分，所以特定的力量可能出现在多个 ADR（架构决策记录） 中。

我们将使用只有几个部分的格式，因此每个文档都易于消化。格式只有几个部分:

**标题**，这些文件的名称是短名词短语。例如，“ADR 1: Deployment on Ruby on Rails 3.0.10” 或 “ADR 9: LDAP for Multitenant Integration

**上下文**，这一节描述了当前的技术、政治、社会和项目。这些力量可能处于紧张状态，应该这样说。本节中的语言是**价值中立**的，只用于**描述事实**。

**决策**，这一节描述我们对这些力量的回应。这是充分的句子，以及积极的声音。 “我们会...”

**状态**，如果项目利益相关方尚未同意，或者一旦达成一致，则 “决定” 可能被 “提议”。如果以后的 ADR （架构决策记录）更改或撤消决定，则可能会将其标记为 “已弃用” 或 “已取代”，并参考其替换。

**后果**，这部分描述了应用决策后产生的上下文。所有的后果应该列在这里，而不仅仅是 “积极的”。一个特定的决策可能会产生积极的、消极的和中性的后果，但是它们都会影响未来的团队和项目。

整个文件应该是一两页长。我们将把每个 ADR（架构决策记录）写成与未来开发者的对话。这需要良好的写作风格，以及完整的句子组织成段落。列表（原文：子弹）只能用于视觉风格，不能作为写作句子的借口。（列表杀人，甚至 PowerPoint 的列表。）

### 新项目检查清单

![新项目检查清单](https://raw.githubusercontent.com/phodal/techlead/master/assets/new-project-checklist.jpg '新项目检查清单')

见：[https://phodal.github.io/new-project-checklist/](https://phodal.github.io/new-project-checklist/)

### Tech Lead 工具集

见：[https://github.com/phodal/techlead](https://github.com/phodal/techlead)

## DevOps

### DevOps 元素周期表

### DevOps 工具功能

```process-step
 - 规划
   - 特性管理
   - 产品待办清单
   - 迭代待办清单
   - 仪表盘
   - 变更管理
 - 编码
   - 软件配置管理
   - 代码库
   - 版本管理
   - 基线
 - 构建
   - 持续集成
 - 测试
   - 缺陷跟踪
   - 测试用例
   - 测试脚本
   - 回归测试
 - 发布
   - 安全管理
 - 部署
   - 发布部署管理
   - 持续交付
   - 开发-测试-验收-生产（DTAP）
 - 运营
   - 事件管理
   - 问题管理
   - 配置管理
 - 监控
   - 报告
```

源自：《DevOps 最佳实践》

见首页

### 测试

#### 分布式状态测试

- [Chaos Monkey](https://github.com/Netflix/chaosmonkey) Chaos Monkey randomly terminates virtual machine instances and containers that run inside of your production environment. Exposing engineers to failures more frequently incentivizes them to build resilient services.
- [Jepsen](https://github.com/jepsen-io/jepsen) Jepsen is a Clojure library. A test is a Clojure program which uses the Jepsen library to set up a distributed system, run a bunch of operations against that system, and verify that the history of those operations makes sense.

### 安全

- [云原生安全模型 BeyondProd](https://cloud.google.com/security/beyondprod/)

### 持续交付

- [GoCD](https://www.gocd.org/) GoCD 是一个开源工具，在软件开发中使用它来帮助团队和组织自动执行软件的持续交付。它支持从代码签入到部署的整个构建-测试-发布过程的自动化。它有助于在较短的周期内继续生产有价值的软件，并确保可以随时可靠地发布该软件。
- [Spinnaker](https://www.spinnaker.io/) 是一个免费的开源持续交付软件平台，最初由 Netflix 开发，并很快被 Google 接受和扩展。它旨在与 Kubernetes，Google Cloud Platform，AWS，Microsoft Azure 和 Oracle Cloud 配合使用，并支持社区定期添加的更多平台。
