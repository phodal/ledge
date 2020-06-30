# 持续集成实践

## 持续集成阶段设计

实施过程步骤：

- 流水线 hello, world
- 构建和部署流程自动化
- 单元测试自动化
- 集成现有代码分析服务
- 验收测试自动化
- 发布自动化

### 普通流水线模型

来自《持续交付 2.0》的示例：

GoCD 示例：

```pipeline
 - 提交构建
   - 编译打包:success
   - 代码扫描:success
   - 单元测试:success
   - 集成测试:success
 - 次级构建
   - 次级构建:success
   - 端到端测试:success
 - 部署到 UAT 环境
   - 部署到 UAT 环境:success
   - UAT 部署:success
 - UAT 结果
   - UAT 结果:success
   - 标记版本:success
 - 性能测试
   - 性能测试:success
 - 内部体验
   - 内部体验:success
   - 上传版本:success
 - 外部体验
   - 外部体验:success
   - 上传版本:success
 - 上传发布
   - 上传发布:success
```

```pipeline
 - 提交阶段
   - 提交阶段:success
   - 编译:success
   - 单元测试:success
   - 检查分析:success
 - 自动化验收测试
   - 自动化验收测试:success
 - 自动化容量测试
   - 自动化容量测试:success
 - 手工测试
   - 手工测试:success
   - 演示:success
   - 探索性测试:success
 - 发布
   - 发布:success
```

### 双流水线模型

CI + CD 分离

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

### 多流水线模型

#### 开源模式

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
