## 加快流动

精益思想五大原则:

 - 价值（Value）
 - 价值流（Value stream）
 - 流动（Flow）
 - 拉动（Pull）
 - 尽善尽美（Perfection）

### 1. 持续集成

### 2. 自动化

### 3. 可视化

### 4. 代码化

#### Dashborad

Dashing: http://dashing.io/

### DevOps 生命周期

```process-table
| 需求 | 开发  | 构建  | 测试 | 部署 | 运维 |
|-|-|-|-|-|-|
| 把运维人员作为首要干系人 | 小团队 | 构建工具 | 自动化测试 | 部署工具 | 监控 |
| 在开发需求时寻找他们的意见 | 有限的合作 | 支持持续集成 | 用户验收测试|支持持续部署|对错误情况做出响应 |
| | 单元测试 | | | | 
```

## 缩短反馈

### 1. 测试驱动开发


```pyramid
 - 测试金字塔
   - 集成测试
   - 组件测试
   - 单元测试
```

测试金字塔

```pyramid
 - 测试金字塔
   - 集成测试
     - E2E 测试
   - 组件测试
   - 单元测试
```

#### 测试策略

来源：《[一页纸测试策略](https://mp.weixin.qq.com/s/cEkI3Duyg-Jqk-TTFwKVqQ)》

> 质量内建，旨在软件交付过程的早期发现并预防缺陷，将任务移动到软件开发生命周期的左侧来提高质量，测试人员可以从需求分析阶段开始介入。

```process-table
| 需求分析 | 开发前 | 开发  | 开发完成 | 测试|  发布前|已发布 |
|--|--|--|--|--|--|--|
| 用户故事评审 | 特性启动 | 单元测试 | 用户故事验收 | 用户故事测试 | 回归测试 | 监控 |
| 估算 | 测试用例设计 | 组件测试 | 底层测试评审 | 探索式测试 | 发布指南 | 支持 |
| 方案设计 | 用户故事启动 | | 发布可测试版本 | 缺陷管理 | 用户验收测试 | 质量分析 |
| 迭代计划 | 测试计划 | | | 风险评估 | 发布版本确认 | | 
| | | | | 集成测试 | | | 
| | | | | 端到端测试 | | |  
```

### 2. 代码回顾

来源：《深入核心的敏捷开发》

```mindmap
 - 代码回顾（CodeReview)
   - 目的：学习 vs 挑错
   - 重点 
     - 代码 vs 作者
     - 习惯 vs bug
     - 模式 vs 反模式
   - 注意
     - 整洁代码 vs 我的写法
     - 整洁代码 vs 重新设计
   - 形式
     - 随机摄取代码（当天编写的）
     - 每日一次，每次半小时以内，每次回顾 200~300 行代码
```

PS：时间视真实的团队而定，如果不能每天进行代码回顾，时间一般控制在 0.5 ~ 1 小时内。

### 3. 小步前进


#### Git Hooks 

Git 钩子列表：

```bash
applypatch-msg     post-merge         pre-auto-gc        prepare-commit-msg
commit-msg         post-receive       pre-commit         push-to-checkout
post-applypatch    post-rewrite       pre-push           update
post-checkout      post-update        pre-rebase
post-commit        pre-applypatch     pre-receive
```

Commit Hook 示例：

```process-table
| 执行提交脚本 | 执行 pre-commit  | 执行 Checkstyle| 执行预置的 lint | 提交代码 |
|-|-|-|-|
| git-cz | husky | checkstyle | lint-staged | git commit |
| conventional-changelog| commitlint |  | | 
|   |  | | |
```

Push Hook 示例：

```process
"git push" -> "执行 prePush" -> "执行 lint" -> "执行 testing" -> "提交"
```

提交信息规范（《[如何好一个 Git 提交信息及几种不同的规范](https://www.phodal.com/blog/how-to-write-a-better-git-commit-message/)》）：

 - build: 影响构建系统或外部依赖关系的更改（示例范围：gulp，broccoli，npm）
 - ci: 更改我们的持续集成文件和脚本（示例范围：Travis，Circle，BrowserStack，SauceLabs）
 - docs: 仅文档更改
 - feat: 一个新功能
 - fix: 修复错误
 - perf: 改进性能的代码更改
 - refactor: 代码更改，既不修复错误也不添加功能
 - style: 不影响代码含义的变化（空白，格式化，缺少分号等）
 - test: 添加缺失测试或更正现有测试


## 持续实验文化

### 持续学习


参考：

 - 《DevOps 实践指南》
