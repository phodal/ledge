# Ledge DevOps 知识平台

## 流程

### 本地开发流程

```process-table
| 执行提交脚本 | 执行 pre-commit  | 执行 Checkstyle| 执行预置的 lint | 提交代码 |
|-|-|-|-|-|
| git-cz | husky | checkstyle | lint-staged | git commit |
| conventional-changelog| commitlint | prettier  | | |
| |  | | | |
```

### DevOps 流程

```process-table
| 源码管理 | 代码质量 | 制品管理  | 测试 | 持续集成 | 分析 | 协作  |
|-|-|-|-|-|-|-|
| Git | TSLint | Git (history) | Jasmine | GitHub Action | GitHub Traffic | GitHub Projects |
| GitHub | Code Climate | |  Jest | | Google Analysis |  |
```

## 测试策略

```mindmap
 - Ledge测试策略
   - 测试对象 & 范围
     - 测试对象：开源项目 Ledge
     - 测试范围
        - 前端功能
        - 前端性能
        - 前端UI
        - 内容逻辑性
        - 浏览器兼容
        - 移动端兼容
     - 测试范围不包括：内容具体细节
   - 测试目标
     - 前端功能正常
     - 前端性能正常
     - 用户体验良好
   - 测试重点 & 难点
     - 前端功能
     - 前端性能
     - 浏览器兼容性
   - 测试深度 & 广度
   - 测试活动安排 & 资源分配
     - 手动功能测试
     - 前端UI自动化
     - 回归测试
     - 资源
   - 测试效果度量
```
