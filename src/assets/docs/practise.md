## 闭环

```class
∞ 
```

未来的软件开发模型（《[云研发：研发即代码](https://github.com/phodal/cloud-dev)》）

```process-step
 - 需求
   - 需求明确
   - 实例化需求
   - 需求代码化
   - 域语言描述需求
 - 设计
   - 设计系统化
   - 设计模式化
   - 代码化设计
   - 代码领域化
 - 代码
   - 开发模式化
   - 代码领域化
   - 需求生成代码
   - 代码化代码
 - 构建 
   - 持续构建
   - 构建自动化
   - 构建代码化
   - 构建构建化
 - 部署
   - 部署自动化
   - 提交即上线
   - 部署代码化
   - 部署自治
 - 运营
   - 运营可视化
   - 运营中心化
   - 代码化运营
   - 运营需求化
```

## 加快流动

精益思想五大原则:

 - 价值（Value）
 - 价值流（Value stream）
 - 流动（Flow）
 - 拉动（Pull）
 - 尽善尽美（Perfection）

### 1. 持续集成

如《Jenkins 权威指南》一书指出，持续集成需要几个不同的阶段

 - 阶段一：无构建服务器
 - 阶段二：夜间构建
 - 阶段三：夜间构建 + 自动化测试
 - 阶段四：加入度量指标
 - 阶段五：更认真地对待测试
 - 阶段六：自动化验收测试和自动化部署
 - 阶段七：持续部署

### 2. 自动化

### 3. 可视化

#### Dashborad

Dashing: http://dashing.io/

### 4. 代码化

#### Pipeline as Code

 - Jenkinsfile

#### Deploy as Code

aka Deployment process as code

 - Dockerfile

#### Docs like Code

 - ADR

特征（[软件技术文档代码化现象](https://zhuanlan.zhihu.com/p/33045831)

 1. **开发方式一致**。软件代码在开发的时候，基本流程是：写代码、审查代码和部署代码，文档在开发时候，也会采用和代码开发相同或类似的方式。
 2. **集成在开发流程中**。文档开发作为软件开发的一部分，也是最终产品的一部分，其开发过程是嵌入在整个软件开发过程中的。
 3. **开发工具一致**。文档写作时，一般使用代码编辑器如 Eclipse 或Visual Studio Code，而不会用诸如 Word 或 FrameMaker 这类工具。
 4. **使用标记语言**。一般使用轻量级标记语言如 Markdown, reStructuredText 或 ASCii 等，或更复杂的 XML 等标记语言。
 5. **文档和代码共同存储**。例如使用 Github，代码和文档会在同一个 repo 下，开发人员和文档工程师都可以访问。
 6. **版本控制**。一般使用 git 或 svn 这类工具进行版本管理。
 7. **网站发布自动化**。内容写作完成后，一拉 webhook 就能自动发布为帮助页面。

### DevOps 生命周期

```process-table
| 需求 | 开发  | 构建  | 测试 | 部署 | 运维 |
|-|-|-|-|-|-|
| 把运维人员作为首要干系人 | 小团队 | 构建工具 | 自动化测试 | 部署工具 | 监控 |
| 在开发需求时寻找他们的意见 | 有限的合作 | 支持持续集成 | 用户验收测试|支持持续部署|对错误情况做出响应 |
| | 单元测试 | | | | 
```

## 缩短反馈

### 测试加快反馈速度

```quadrant
 - 测试四象限 （Brain Marick）
     - 自动/手动
       - 用户故事测试
       - 端到端测试
       - 回归测试
       - ……
     - 手动
       - 探索式测试
       - 用户验收测试
       - 用户演示（showcase）
       - 用户培训
       - 安全测试（业务部分）
       - ……
     - 自动化
       - 单元测试
       - 组件测试
       - 集成测试
       - ……
     - 工具
       - 安全测试（技术部分）
       - 性能测试
       - 辅助功能测试
       - ……

config: {"left": "支持团队", "right": "评价产品", "bottom": "面向技术", "top": "面向业务"}
```

#### 测试金字塔

```pyramid
 - 测试金字塔
   - 集成测试
   - 组件测试
   - 单元测试
```

#### 测试驱动开发

依据 J.Timothy King 所总结的《[测试先行的12个好处](http://sd.jtimothyking.com/2006/07/11/twelve-benefits-of-writing-unit-tests-first/)》：

 - 测试可证明你的代码是可以解决问题的
 - 一面写单元测试，一面写实现代码，这样感觉更有兴趣
 - 单元测试也可以用于演示代码
 - 会让你在写代码之前做好计划
 - 它降低了 Bug 修复的成本
 - 可以得到一个底层模块的回归测试工具
 - 可以在不改变现有功能的基础上继续改进你的设计
 - 可以用于展示开发的进度
 - 它真实的为程序员消除了工作上的很多障碍
 - 单元测试也可以让你更好的设计
 - 单元测试比代码审查的效果还要好
 - 它比直接写代码的效率更高


详见：《[测试驱动开发](https://growth.phodal.com/#%E6%B5%8B%E8%AF%95%E9%A9%B1%E5%8A%A8%E5%BC%80%E5%8F%91)》

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

#### 测试替身

> 有时候对被测系统(SUT)进行测试是很困难的，因为它依赖于其他无法在测试环境中使用的组件。这有可能是因为这些组件不可用，它们不会返回测试所需要的结果，或者执行它们会有不良副作用。在其他情况下，我们的测试策略要求对被测系统的内部行为有更多控制或更多可见性。 如果在编写测试时无法使用（或选择不使用）实际的依赖组件(DOC)，可以用测试替身来代替。测试替身不需要和真正的依赖组件有完全一样的的行为方式；他只需要提供和真正的组件同样的 API 即可，这样被测系统就会以为它是真正的组件！ ——Gerard Meszaros

Mock 和 Stub 就是常见的两种方式：

 - Stub 是一种状态确认，它用简单的行为来替换复杂的行为
 - Mock 是一种行为确认，它用于模拟其行为

示例见：《[测试替身](https://growth.phodal.com/#%E6%B5%8B%E8%AF%95%E6%9B%BF%E8%BA%AB)》

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
|-|-|-|-|-|
| git-cz | husky | checkstyle | lint-staged | git commit |
| conventional-changelog| commitlint |  | | | 
| |  | | | |
```

Push Hook 示例：

```process
"git push" -> "执行 prePush" -> "执行 lint" -> "执行 testing" -> "提交"
```

提交信息规范（《[如何好一个 Git 提交信息及几种不同的规范](https://www.phodal.com/blog/how-to-write-a-better-git-commit-message/)》）：

 - **build**: 影响构建系统或外部依赖关系的更改（示例范围：gulp，broccoli，npm）
 - **ci**: 更改我们的持续集成文件和脚本（示例范围：Travis，Circle，BrowserStack，SauceLabs）
 - **docs**: 仅文档更改
 - **feat**: 一个新功能
 - **fix**: 修复错误
 - **perf**: 改进性能的代码更改
 - **refactor**: 代码更改，既不修复错误也不添加功能
 - **style**: 不影响代码含义的变化（空白，格式化，缺少分号等）
 - **test**: 添加缺失测试或更正现有测试


## 持续实验文化

### 持续学习


参考：

 - 《DevOps 实践指南》
