# Ledge DevOps 知识平台

## DevOps 模板

 - 问题和现状分析，关键诉求
 - 期望通过DevOps达到的目标
 - 组织团队设计，研发过程设计
 - 开发框架选项和架构设计
 - 持续集成和持续交付最佳实践
 - 测试最佳实践
 - 后期自动化监控运维最佳实践总结
 - 整体实施效果和收益分析总结

from: [推荐-DevOps知识框架体系和最佳实践案例整理](https://www.toutiao.com/i6920459336573551108/)

## 流水线设计

### 本地阶段

```pipeline
 - 预本地提交阶段
   - 提交信息检查:success
   - Lint:success
   - 自动 Lint 修复:success
 - 本地提交
   - 本地提交:success
 - 预提交服务器阶段
   - 预提交服务器阶段:success
   - 单元测试:success
 - 提交
   - 提交:success
```

配置示例：[https://github.com/phodal/ledge/blob/master/package.json](https://github.com/phodal/ledge/blob/master/package.json)

示例文章：[eslint+husky+prettier+lint-staged提升前端应用质量](https://juejin.im/post/5c67fcaae51d457fcb4078c9)


### CI + CD + PR 三流水线模型

场景：

1. 构建时间长，所以拆分了三个 job，以达到快速交付的目的
2. GitHub Action 支持双流水线模式

#### 持续集成

```pipeline
 - 代码检出
   - 代码检出:success
 - 安装依赖
   - 安装依赖:success
 - 构建
   - Lint:success
   - Build:success
 - 测试
   - 单元测试:success
 - 上传结果
   - 上传测试覆盖率:success
   - 上传构建结果:success
```

#### 持续交付

```pipeline
 - 代码检出
   - 代码检出:success
 - 安装依赖
   - 安装依赖:success
 - 构建
   - 构建:success
 - 构建服务端渲染
   - 构建服务端渲染:success
 - 部署
   - 部署:success
```

#### PR 流水线

PS：针对于外部开源请求代码

```pipeline
 - 代码检出
   - 代码检出:success
 - 安装依赖
   - 安装依赖:success
 - 构建
   - Lint:success
   - Build:success
 - 测试
   - 单元测试:success
```

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
