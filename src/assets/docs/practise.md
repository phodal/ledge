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

Commit Hook 示例：

```process
"执行提交脚本" -> "执行 preCommit" -> "执行预置的 lint" -> "提交代码"
```

Push Hook 示例：

```process
"git push" -> "执行 prePush" -> "执行 lint" -> "执行 testing" -> "提交"
```

## 持续实验文化

### 持续学习


参考：

 - 《DevOps 实践指南》
