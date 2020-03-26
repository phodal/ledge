# 工具

## 架构


### 权衡滑块

EN：Trade-off Sliders

源自：《架构师修炼之道》

> 与利益相关方讨论任务优先级时，可以让对方做一个极端的选择：如果我们现在只能够做两件事中的一件，那么应该做哪一件？这个方法能够帮助利益相关方在难以取舍时做出选择。

准备事项：对比选项，如质量属性、成本、进度、功能等。

对比选项示例

| 对比项 | 选择结果  |
|-|-|
| 更高的性能 vs 更高的准确度 | 更高的性能，前提是准确度不能低于一定标准 |
| 成本 vs 上市时间 | 上市时间，务必在规定时间实现系统功能，哪怕是要背负技术债务 |
| 可用性 vs 安全性 | 安全性，这是最重要的质量属性 |
| 可用性 vs 成本   | 可用性，为了实现高可用性，对方愿意出资购买冗余设备 | 

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


### 工作路径

En: Ways of Working

[武汉敏捷 PM Open Day 学习小记](https://www.jianshu.com/p/afac945a1d27)

## DevOps

### DevOps 元素周期表

```webcomponents-test
{
  "name": "wc-devops-periodic",
  "src": "https://phodal.github.io/devops-periodic/elements.js",
  "props": []
}
```

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
