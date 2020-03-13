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

### 2. 代码评审

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
