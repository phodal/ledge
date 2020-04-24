# Ledge DevOps 知识平台

## 流程

### 本地开发流程

```table-step
| 执行提交脚本 | 执行 pre-commit  | 执行 Checkstyle| 执行预置的 lint | 提交代码 |
|-|-|-|-|-|
| git-cz | husky | checkstyle | lint-staged | git commit |
| conventional-changelog| commitlint | prettier  | | |
| |  | | | |

config: { "rowHeight": "180px", "colors": [{"bg":"#e55852","font":"#b71a09"},{"bg":"#e98832","font":"#c85113"},{"bg":"#f0d668","font":"#b88d0f"},{"bg":"#a4c9cf","font":"#598893"},{"bg":"#47c0af","font":"#175a54"},{"bg":"#387fd5","font":"#9ac9f5"},{"bg":"#7753df","font":"#cbb5f8"}]}
```

### DevOps 流程

```table-step
| 源码管理 | 代码质量 | 制品管理 | 测试 | 持续集成 | 构建 | 部署  | 分析 | 协作  |
|-|-|-|-|-|-|-|-|-|
| Git | TSLint | GitHub | Jasmine | GitHub Action | Node.js | GitHub Action | GitHub Traffic | GitHub Projects |
| GitHub | Code Climate | NPM |  Karma  |  | Yarn | Scully | Google Analysis |  |
|  | CodeCov | | | |  | |

config: { "rowHeight": "230px", "colors": [{"bg":"#e55852","font":"#b71a09"},{"bg":"#e98832","font":"#c85113"},{"bg":"#f0d668","font":"#b88d0f"},{"bg":"#a4c9cf","font":"#598893"},{"bg":"#47c0af","font":"#175a54"},{"bg":"#387fd5","font":"#9ac9f5"},{"bg":"#7753df","font":"#cbb5f8"},{"bg":"#00a2a1","font":"#3de8e7"},{"bg":"#666666","font":"#eee"}]}
```

```dev-process
 - 协作
   - 协作
     - GitHub
 - 源码管理
   - 源码管理
     - Git
 - 代码质量
   - 代码质量
     - Code Climate
     - TSLint
     - CodeCov
 - 制品管理
   - 制品管理
     - NPM
     - GitHub
 - 测试
   - 测试
     - Jasmine
     - Karma
 - 持续集成
   - 持续集成
     - Github
 - 构建
   - 构建
     - Node.js
     - Npm
     - Yarn
 - 部署
   - 部署
     - GitHub
 - 分析
   - 分析
     - Google Analytics
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
