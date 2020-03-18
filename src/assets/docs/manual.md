## 建立远景与方向

## 评估与度量

## 准入条件

## 探索：可行方案

### 持续集成

#### 度量工具

##### 代码覆盖率

  - Java
    - [Cobertura](http://cobertura.github.io/cobertura/) 
    - [Jacoco](https://www.eclemma.org/jacoco/)
    - [Atlassian Clover](https://www.atlassian.com/software/clover)
  - JavaScript
    - [Istanbul](https://istanbul.js.org/)
    - [Jest](https://jestjs.io/)
  - Go

##### 自动化性能测试

   - JMeter

##### 代码质量分析工具

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

##### 自动修复工具

 - Prettier 是一个代码风格统一工具。
 - Angular Lint。``ng lint --fix``

### 多团队探索

如《架构师修炼之道》的『方法 15：分而治之』所建议的探索案例：

第一周的探索案例：

| 小组  | 探索任务  | 展示与说明  |
|-|-|-|
| 1 | 重构插件框架，判断原有代码库能否复用 | 展示重构的主要接口和类，说明计划是可行的 |
| 2 | 尝试 gRPC 服务 | 演示 Ruby 客户端与 Java 服务端的通讯 |
| 3 | 创建概念图并设计微服务分区 | 展示初步概念图。说明还有这么多工作要做 |

第二周的探索案例：

| 小组  | 探索任务  | 展示与说明  |
|-|-|-|
| 1 | 通过命令行调用原有插件 | 比预计的工作量多。说明存在哪些障碍，以及计划如何补救 |
| 2 | 寻找合适的数据库  |  比较三种数据库的优劣（快速浏览其代码）|
| 3 | 完善概念图，继续设计微服务分区 | 展示概念图和微服务的分区设计 | 


## 选择方案

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
    - 带有多重交会流水线的多级 IT
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

## 第一次 Showcase

## 实施方案

## 实施之后

## DevOps 四大支柱

来源：（《Effective DevOps》）

 - **协作**。协作是通过支持多人的交互和输入来构建一个特定结果的过程。
 - **亲密性**。不仅需要发展和维护个人之间的协作关系，还需要在组织内部、整个行业的团队和部分之间也需要建立紧密的关系。
 - **工具**。工具是一个加速器，可以基于当前的文化和方向推动变化。
 - **规模化**。规模化强调的是组织在整个生命周期中，所采用的过程和关键点。
 
## 工具

```process
"个人实践" -> "记录流程" -> "形成统一语言" -> "抽象原则与模式" -> "标准化流程（工具）"
```

### BDD 工具选型

> Behavior Driven Development，行为驱动开发是一种敏捷软件开发的技术，它鼓励软件项目中的开发者、QA 和非技术人员或商业参与者之间的协作。

《[BDD 框架对比: Cucumber.js vs Robot Framework vs Gauge.js](https://github.com/phodal/bdd-frameworks-compare)》

![Workflow](/assets/docs/images/bdd_process.jpg 'BDD Workflow')

## 人

来源：Scott Prugh 《[Continuous Delivery](https://www.scaledagileframework.com/guidance-continuous-delivery/)》

```process-step
 - I 型（专家）
   - 精通某个领域
   - 其它领域的技能或经验很少
   - 很快遇到瓶颈
   - 对下游的浪费和影响不敏感
   - 抵制灵活或者可变的计划
 - T 型（通才）
   - 精通某个领域
   - 拥有很多领域的技能
   - 能突破瓶颈
   - 帮助制订灵活和可变的计划
 - E 型
   - 精通某几个领域
   - 有多个领域的实践经验，执行能力强，能持续创新
   - 潜力无限
```
