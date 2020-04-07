# 建立远景与方向

## 业务关注点

| 组成部分标题 | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| 问题         | 为什么对组织来说引入 DevOps 实践是有好处的？                       |
| 成本         | 引入 DevOps 实践的预期成本是什么？                                 |
| 干系人影响   | 对内部和外部干系人的影响是什么？                                   |
| 风险和缓解   | 与引入 DevOps 实践相关联的组织和技术风险是什么？如何减缓这些风险？ |
| 推出计划     | 推出 DevOps 的实践计划是什么？                                     |
| 成功标准     | 我们如何知道 DevOps 实践的引入是成功的 ？                          |

—— 《DevOps 架构师行动指南》

## 识别目标和现状

## 明确 DevOps

DevOps 流程

![DevOps 流程](/assets/docs/images/devops.png 'DevOps 流程')

- 规划
- 编码
- 构建
- 测试
- 发布
- 部署
- 运维
- 监控

DevOps 框架

—— 出自《DevOps 最佳实践》

![DevOps 框架](/assets/docs/images/devops-framework.jpg 'DevOps 框架')

- DevOps 持续测试。
- DevOps 敏捷开发。
- DevOps 持续集成。
- DevOps 持续交付。
- DevOps 持续监控。
- DevOps 敏捷流程。

## 可视化现状和未来

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

### Path to DevOps

```process-table
|源码管理|制品管理|配置管理|数据库自动化|测试|持续集成|监控|分析|智能运维| 协作|
|---|---|---|---|---|---|---|---|---|---|
|---|---|---|---|---|---|---|---|---|---|
```

# 度量

《持续交付 2.0》中提到了一种不错的软件产品的交付效能度量方式：

```mindmap
 - 软件产品的交付效能
   - 速度
     - 需求响应能力
        - Feature Lead Time（业务需求前置周期）
        - User Story Delivery Time（用户故事交付周期）
     - 持续发布能力
        - Integration Testing Time（集成测试周期）
        - Release Frequency Time（发布频率）
        - MTT（X)（X 的平时时长，X = 发布 | 升级 | 缓解 | 解决）
   - 质量
     - 发布前质量
        - Remain Bugs（单位周期的遗留缺陷数）
        - Bugs/User Story（单个用户故事发现的缺陷数）
     - 发布后质量
        - Change Failure Rate（变更失败率）
        - Issues（单位时间内的生产环境故障数）
   - 价值
     - 需求吞吐量
        - Total Features（单位时间内交付的业务需求数）
     - 交付有效性
        - Success Rate（业务需求的成功率）
```

## 度量团队和组织

## 度量系统

### 度量构建

是否拥有构建？

统计：

- 失败次数。
- 失败原因。常见：环境问题、专业度问题
- 构建时间。
- 构建流程。
- 如何管理依赖。

### 代码覆盖率

- Java
  - [Cobertura](http://cobertura.github.io/cobertura/)
  - [Jacoco](https://www.eclemma.org/jacoco/)
  - [Atlassian Clover](https://www.atlassian.com/software/clover)
- JavaScript
  - [Istanbul](https://istanbul.js.org/)
  - [Jest](https://jestjs.io/)
- Go

### 自动化性能测试

- JMeter

### 代码质量分析工具

- Java
  - CheckStyle
  - PMD/CPD
  - FindBugs
  - CodeNarc
- JavaScript / TypeScript
  - Codelyzer
  - ESLint
- 通用
  - Sonar

## 技术债务评估

> 对于技术债务，它的利息表现为系统的不稳定性，以及由于临时性手段和缺乏合适的设计、文档工作和测试带来的不断攀升的维护成本。 —— 《架构师应该知道的 97 件事》

如 Robert Nord 提出的 “技术债务全景图”（Tech Debt Landscape） 所示：

![Tech Debt LandScape](/assets/docs/images/tech-debt-landscape.png)

技术债对于软件的影响：可维护性（Maintainability）、可演进性（Evolvability），而这些技术债对于非技术人员来说都是不可见的。它们源于生活，藏于黑暗中。

### 技术债头脑风暴

1. 团队一起列出潜在的技术债
2. 归纳、分类技术债
3. 优先级排序
4. 物理板可视化

### 可视化

#### 技术债看板

```table-step
| todo | doing | done |
|-|-|-|
|  Lodash 体积过大 | | Jasmine -> Jest |
```

#### 技术债热力图

服务级别热力图

![技术债热力图](/assets/docs/images/heat-map-services.jpg '技术债热力图')

代码热力图？

```echarts
{
"series": [
    {
        "type": "treemap",
        "breadcrumb": {"show": false},
        "roam": "move",
        "data": [{
            "name": "nodeA","value": 10,
            "children": [
              {"name": "HealthController.java", "value": 4 },
              {"name": "HealthService.java", "value": 6}
            ]},
            {"name": "HealthModel.java", "value": 20}
        ]
    }
]
}
```

#### 技术债墙

```quadrant
 - 技术债墙
     - 快速解决
       - ……
       - ……
       - ……
     - 分解并计划
       - ……
       - ……
       - ……
     - 在可能的时候提升
       - ……
       - ……
     - 暂时不管
       - ……
       - ……
       - ……

config: {"left": "简单", "right": "困难", "bottom": "不重要", "top": "重要"}
```

### 技术债务评估

相关文章：

- 《[Defects 的启示](https://insights.thoughtworks.cn/about-defects/)》

# 准入条件

## 有意愿的组织

## 有意愿的个人

## 组织提供支持

## 团队

### 团队发展阶段模型

Bruck Tuckman 团队发展模型：

- 组建期
- 激荡期
- 规范期
- 执行期
- 休整期

守 -> 破 -> 离

```process-step
 - 组建期和激荡期：建立信任
   - 搞定问题的能力
   - 积极主动的态度
   - 团队合作的意识
 - 规范期和执行期：关注价值流程
   - "拉动"
 - 执行期：仪式感
   - ''
```

—— 来自《深入核心的敏捷开发》

## DevOps 看板

### 可视化现状

# 探索：可行方案

## 可构建

### 遗留系统问题

9 种遗留系统现代化的技术

| 发生变化的方面 | Retain | Retire | Encapsulation | Rehost | Replatform | Refactor | Rearchitecture | Rebuild | Repuchase |
| -------------- | ------ | ------ | ------------- | ------ | ---------- | -------- | -------------- | ------- | --------- |
| 产品功能       | No     | No     | No            | No     | No         | Yes      | No             | Yes     | Yes       |
| 架构           | No     | No     | Yes           | No     | Yes        | No       | Yes            | Yes     | Yes       |
| 基础设施       | No     | No     | No            | Yes    | Yes        | No       | Yes            | Yes     | Yes       |
| 代码           | No     | No     | No            | No     | Yes        | No       | Yes            | Yes     | Yes       |

出处：《[Legacy System Modernization: How to Transform the Enterprise for Digital Future](https://www.altexsoft.com/whitepapers/legacy-system-modernization-how-to-transform-the-enterprise-for-digital-future/)》

## 可测试

选择测试框架并不是算太困难，只是我们需要知道是否需要：测试即文档。

### 遗留代码

如我在《[系统重构与迁移指南](https://migration.ink/)》一书中指出，要给遗留系统项目加测试并不是一件容易的事情。你需要找到对应年代的测试框架，熟悉对应年代的技术栈，然后才能一点点切入系统。

而后，当你遇到诸如 Java 中的 static 方法调用链时，你会发现难以继续往下，便得想着办法重构。而因为没有测试，你又没有办法重构。

#### 重构没有测试，测试加不了？

## 持续集成

### 流水线

策略

过程步骤：

- 流水线 hello, world
- 构建和部署流程自动化
- 单元测试自动化
- 集成现有代码分析服务
- 验收测试自动化
- 发布自动化

来自《持续交付 2.0》的示例

```process-table
| 提交阶段 | 自动化验收测试 | 自动化容量测试 | 手工测试 | 发布 |
|-|-|-|-|-|
| 编译 | | | 演示 | |
| 单元测试  | | | 探索性测试 | |
| 检查分析 | | | | |
| 构建安装包 | | | | |
```

## 多团队探索

如《架构师修炼之道》的『方法 15：分而治之』所建议的探索案例：

第一周的探索案例：

| 小组 | 探索任务                             | 展示与说明                               |
| ---- | ------------------------------------ | ---------------------------------------- |
| 1    | 重构插件框架，判断原有代码库能否复用 | 展示重构的主要接口和类，说明计划是可行的 |
| 2    | 尝试 gRPC 服务                       | 演示 Ruby 客户端与 Java 服务端的通讯     |
| 3    | 创建概念图并设计微服务分区           | 展示初步概念图。说明还有这么多工作要做   |

第二周的探索案例：

| 小组 | 探索任务                       | 展示与说明                                           |
| ---- | ------------------------------ | ---------------------------------------------------- |
| 1    | 通过命令行调用原有插件         | 比预计的工作量多。说明存在哪些障碍，以及计划如何补救 |
| 2    | 寻找合适的数据库               | 比较三种数据库的优劣（快速浏览其代码）               |
| 3    | 完善概念图，继续设计微服务分区 | 展示概念图和微服务的分区设计                         |

# 选择方案

如 《DevOps 实施手册：在多级 IT 企业中使用 DevOps》 所介绍的 DevOps 实施方案，几点要求：

- 明确界定目标状态（业余目标及驱动力）
- 理解现状（能力及成熟度模型）
- 识别交付流水中效率低下领域的瓶颈问题（通过实施价值流程图）

结合之下我们有了初步的方案选择：

```mindmap
 - 建议衡量标准与关键绩效指标
    - 项目关键绩效指标
       - 速度
       - 成本
    - 关键绩效指标组合
    - 质量关键绩效指标
    - 交付流水线优化关键绩效指标
    - 文化关键绩效指标
 - 敏捷实施
    - 自动化部署
    - 进入类生产环境
    - 自动化测试
    - 监控与反馈
 - 集成的交付流水线
    - 实现端到端的可追溯性
    - 带有多重交付流水线的多级 IT
 - 持续集成
 - 持续交付
    - 自动化部署
    - 数据库部署
    - 部署内容、方式及环境
    - 持续集成到持续交付
    - 推送及拉取
    - 实施持续交付
    - 持续交付平台
 - 测试前移
    - 自动化测试与持续测试
    - 测试服务及环境虚拟化
    - 测试数据管理
 - 运维参与前移
    - 转变运维角色
    - IT 服务管理与 DevOps
 - 持续监控及反馈
    - 提供监控与反馈
    - 持续改进
 - 发布管理
    - 发布流程管理
    - 非持续发布周期的持续交付
```

## DevOps 技术栈知识图谱

### DevOps

来源：[https://github.com/raycad/devops-roadmap](https://github.com/raycad/devops-roadmap)

```mindmap
 - 源码管理
   - 源码管理服务
     - Gitlab
     - Gitea
     - Gogs
 - 前端
   - 框架
     - React
     - Angular
     - Vue
   - 构建工具
     - Webpack + Gulp
   - 单元测试
     - Jest
     - Jasmine
     - Karma
 - 后端
   - 语言和框架
     - Golang
       - Gin
       - Echo
     - Java
       - Spring Boot
     - Node.js
       - Express
       - Koa
       - Next.js
     - Python
       - Django
       - Flask
   - IAM
     - OAuth
     - JWT
   - 消息代理
     - Kafka
     - RabbitMQ
     - ZeroMQ
   - Web 服务器
     - Apache
     - Nginx
   - Mock API
     - JSON Server
     - Moco
     - Mockoon
   - API 文档
     - Swagger
 - 数据库
   - 关系型数据库
     - PostreSQL
     - MariaDB
     - MySQL
   - 非关系型数据库
     - 文档存储
       - MongoDB
       - RethinkDB
     - 键值存储
       - Redis
       - Memcached
     - 搜索引擎
       - ElasticSearch
       - Solr
     - 时序
       - InfluxDB
       - Graphite
     - 图形数据库
       - Neo4j
 - API 网关
   - Traefik
   - Kong
   - Zuul
 - 云计算
   - OpenStack
   - CloudStack
 - 服务测试
   - API 测试
     - jMeter
     - Postman
   - 性能测试
     - nGrinder
     - jMeter
     - wrk
   - 自动化 E2E 测试
     - Selenium
     - Cucumber
 - 运维
   - 容器化
     - Docker
   - 编排
     - Kubernetes
   - CI/CD
     - Jenkins
     - GoCD
     - Drone
   - 配置管理
     - Ansible
     - Chef
   - 监控
     - Grafana
     - Nagios
     - Icingga
   - 日志管理
     - ELK
     - Fluentd
     - Apache Flume
 - 大数据
   - 数据流
     - Apache Spark Streaming
     - Flink
   - 数据处理
     - Apache Spark
     - Apache Storm
   - 数据集成（ETL)
     - Apache NiFi
     - Pentaho
```

## 自动修复工具

- Prettier 是一个代码风格统一工具。
- Angular Lint。`ng lint --fix`

# MVP

## 规划示例

|            | 阶段 1：规范和标准制定 | 阶段 1.5：现状调研和评估 | 阶段 2.0： 一体化平台调研与规划 | 阶段 2.5：工程教程的赋能 |
| ---------- | ---------------------- | ------------------------ | ------------------------------- | ------------------------ |
| 目标       |                        |                          |                                 |                          |
| 周期及范围 |                        |                          |                                 |                          |
| 总要举措   |                        |                          | 调研：<br> 规划： <br> 协调：   |                          |
| 产出物     |                        |                          |                                 |                          |
| 资源及职责 |                        |                          |                                 |                          |

## 审视架构

### 可视化架构

#### C4 模型

### 调整架构 ？

#### 康威定律

## 搭建持续集成

## 代码化构建流

## 代码化配置

### 数据库自动化

#### 引入 Flyway

## 实施自动化测试

#### 后端测试体系

#### 前端测试体系

#### Android 测试体系

官方指南：《[Build effective unit tests](https://developer.android.com/training/testing/unit-testing)》

| 分类     | 框架                        | 覆盖范围                                                                                                               | 是否依赖设备 | 执行速度                                                                                                                                                                                           |
| -------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 大型测试 | Appium, UIAutomator\*       | 用户通过界面操作的流程（涉及多应用和系统 UI 交互）                                                                     | 是           | 慢，分钟级（一般在 1 ~ 5 分钟内，依测试场景复杂度而定）                                                                                                                                            |
| 中型测试 | JUnit，Instrumentation      | 功能测试：用户通过界面操作的流程(只能在单个应用内操作)；集成测试：Java 方法(依赖 Android 框架、数据库、第三方能力实现) | 是           | 较慢，涉及界面操作的在分钟级(一般在 0.5~3 分钟，和同样操作步骤的界面测试相比，单个测试用例执行时间要少 40%)；较快，不涉及界面操作的 Java 方法的测试在秒级(一般在 1 秒内，依被测方法的执行时间而定) |
| 小型测试 | JUnit，Mockito，Robolectric | “纯”Java 方法(不依赖 Android 框架、数据库、第三方能力，或这些依赖可以很方便的 Mock，对代码可测试性要求较高)　          | 否           | 快，毫秒级                                                                                                                                                                                         |

类型：

- 本地测试
  - JUnit
  - Mockito
  - Powermock
  - [Robolectric](http://robolectric.org/)
- 插桩测试
  - hamcrest
  - espresso
  - uiautomator
- E2E
  - [Calabash](https://calaba.sh)
  - Robot Framework
  - Appium

相关资源：

- 《[移动客户端 /UI 开源测试框架梳理和大比拼](https://testerhome.com/topics/18308)》

#### iOS 测试体系

- UiAutomation
- XCTest
- Frank
- KIF
- Kiwi

## 自动化部署应用

### K8S + Dockerfile

### 非镜像的自动化方案

## 引入监控

> 监控，观察并记录系统状态变化和数据流的过程。

### ELK

ElasticSearch + Logstash + Kibana

### Kafka + Flink

## 追踪问题

## 第一次 Showcase

# 实施方案

## 主干开发

### 特性开关

特性开关（Feature Toggle）是一种允许控制线上功能开启或者关闭的方式，通常会采取配置文件的方式来控制。当我们需要 A 功能的时候，我们就只需要把 A 功能的开关打开。当我们需要 B 功能，而不需要 A 功能的时候，我们就可以把相应的功能关掉。

# 实施之后

## 回顾和总结

## 输出

# 规模化

## DevOps 能力中心

### 建设框架

```process-step
 - 招募种子
   - 明确目标、职责
   - 组织内提供种子候选人
 - 训战：专项培训
    - DevOps 知识体系
    - DevOps 实践
 - 训战：项目实战
    - 模拟项目
    - 真实项目
 - 训战：辅导分享
    - 守
    - 破
    - 离
 - 答辩评估
    - 能力认证
 - 认证通过
    - ""
```

### DevOps 内部教练

## DevOps 平台

### 工具标准化

### 流程标准化

#### 提交信息门禁

# 附录 1：移动应用的自动化测试

## BDD 方式

文章来源：《[【架构拾集】移动应用的自动化测试（BDD 方式）](https://www.phodal.com/blog/phodal-architecture-101-mobile-appllication-test-architecture/)》

### 技术远景

作为一个团队的技术负责人，我希望：拥有一个移动应用测试架构，它能快速让测试人员快速上手——阅读、编写测试用例。与此同时，我希望这些测试用例是能让非技术人员阅读，诸如业务分析人员，并且符合真实的用户使用场景。

### 架构设计

当我们谈到业务分析人员也能编写的测试，我们说的只有 BDD（Behavior Driven Development，行为驱动开发）。它是一种敏捷软件开发的技术，它鼓励软件项目中的开发者、QA（测试人员）和非技术人员或商业参与者之间的协作。

BDD 在这一种上相当的迷人——能让非技术人员编写测试。而其核心的部分在于：创建了一个环境隔离的 DSL，仿人类语言的 DSL。咳咳，这个 DSL 实现起来，可不轻松。关注顶层 DSL 的同时，开发人员还要努力实现好底层的实现。举个简单的例子，如下是之前在 BDD 一文中的 DSL 示例，这是顶层的设计：

```gherkin
功能: 失败的登录

  场景大纲: 失败的登录
    假设 当我在网站的首页
```

对应的，开发人员需要编写实现：

```javascript
...
Given('当我在网站的首页', function() {
  return this.driver.get('http://0.0.0.0:7272/');
});
..
```

从上述的代码中，一眼就可以看出复杂的地方，实现一个领域特定（业务特定）的 DSL 语言。

我们要完成的 DSL 实现，上层是提供一个 DSL，下层则是对接 driver 的 Agent 层。在 Web 领域里，这个 driver 的 Agent 层负责对接不同的浏览器，诸如 Selenium，driver 则视不同的浏览器而有所不同，如 ChromeDriver、FirefoxDriver、PhantomJSDriver 等等。Selenium 这样的测试框架，除了通过 driver 直接操作了浏览器，还提供了不同语言的编程接口。

相似的，在 APP 领域也有这样的方案，它要通常这个 agent 来连接物理设备，并提供一系列的编程接口。

### 架构设计方案

对整个架构有了一个基本的认识之后，让我们继续往下移动，来重新发掘一下：我们究竟需要哪些基本元素？

- BDD 测试框架，为开发人员提供可创建 DSL 的接口。
- 移动设备的测试编程接口，提供一个操作移动应用的接口。
- 连接移动设备的操作库，即移动端的 WebDriver。
- 用于编写测试时的 UI 检查工具。

从这一点上来看，它与 Web 应用的 BDD 架构差不多。为此，我们需要准备如下的一些框架：

- Robot Framework，一个支持 BDD 的、基于 Python 编写的功能自动化测试软件框架。
- Appium，是一个开源测试自动化框架，用于原生，混合和移动 Web 应用程序。它使用 WebDriver 协议来驱动 iOS、Android 和 Windows 应用程序。
- XCUITest Driver，基于 Apple 官方的界面自动化测试 XCUITest 封装的测试接口，可以直接执行 iOS 的自动化测试。
- UiAutomator2 Driver，则是 Google 官方提供的用于 Android 系统的测试接口，可以直接执行 Android 的自动化测试。
- Appium Inspector，用于查找 iOS/Android 上的元素
- UiAutomator Viewer，由 Android SDK 自带的元素查找工具。

由于我们计划的顶层是由 DSL 来实现，而对应的 BDD 层实现是由 Robot Framework 来完成的。Robot Framework 使用的是 Python 语言，我们就需要找到对应的 Python 主要依赖有：

- robotframework，即 Robot Framework 本身
- robotframework-appiumlibrary，用于为 Robot Framework 提供 Appium 相应的接口封装
- robotframework-ride，用于 Robot Framework 的测试数据编辑器

有了这些主要的库，我们就可以编写我们的 DSL？不，我们还需要配置好，对应的移动端 Driver。

**Android Driver 依赖**

比较简单，通过 `appium-uiautomator2-driver` 库就拥有了 driver。

**iOS Driver 依赖**

为了实现对 iOS 设备的自动化测试，需要安装 XCUITest，为此我们需要下面的这一系列工具：

- `libimobiledevice`，是一个跨平台的用于与 iOS 设备通讯的协议库，它可以让 Windows、macOS、GNU/Linux 系统连接 iPhone/iPod Touch 等 iOS 设备。
- `carthage` 是一个简单的、去中心化的依赖管理工具。
- `ios-deploy` 是一个使用命令行安装 iOS 应用程序到连接设备的工具
- `xcodebuild`，是苹果发布自动构建的工具。
- `xcpretty`，用于对 xcodebuild 的输出进行格式化，包含输出 report 功能。

看，有了这一系列的知识，我们几乎知道怎么做搭建移动应用的自动化测试。
