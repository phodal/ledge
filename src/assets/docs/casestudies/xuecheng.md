# 携程

## 携程酒店

来源《[DevOps 测试实践](https://www.infoq.cn/article/yBv6vbCz6fpuWGiMebaG)》

### DevOps 测试流程

```process-table
| 静态扫描|单元测试|接口测试|熔断测试|比对测试|流量回放|性能测试|功能测试|发布验证|生产监控|
|-|-|-|-|-|-|-|-|-|-|
```

指标

| DevOps 指标 | 测试分析 | 测试监控 |
|-|-|-|
| 交付时间   | 代码覆盖率统计 | 日志 | 
| 流动时间   | 提交代码质量  |  性能 |
| 部署失败率 | 各测试阶段数据 |  业务 |
| ……       | 风险分析      |    |

####  DevOps 测试平台– Moss

```process-table
| 流程可视化配置 | 工具链整合  |  All in One | 发布评估  |
|-|-|-|-|
| 通过可视化图表的方式进行流程配置 | 根据配置的流程调用工具链中的工具，并可视化返回结果  |  开发、测试、平台都可以在一个平台上查看和操作 | 根据整个流程反馈的数据进行风险评估，达到发布把关的目的 |
```

###  DevOps 测试工具链

> 基于开源框架开发的安全扫描工具 Cobra 和 Buffalo
 
```process-table
| 静态扫描 | 单元测试 | 集成测试 | 系统测试 | 监控
|-|-|-|-|-|
| Sonar | UTP   | CAS | CAS UI | Smart |
| Infer | JUnit | JobIt | Diff | Artemis
| Cobra | | Mock | ATL | Mdaga
| Buffalo | | | Wacher | | 
```

> 为了整合单元测试的编写，执行和结果而开发了 UTP 单元测试平台。该平台由 Junit 扩展库 UtpJunit，IDEA 插件 UtpGenerator 以及 Utp 站点组成。该平台实现了 BDD 驱动，代码分析，在线 WebIDE，单元测试执行，覆盖率统计，报告展示，持续集成等功能。

### 总结 

经验和教训：

 - 高度自动化，尽可能减少人为干预
 - 需要快速且准确的反馈问题
 - 要制定 DevOps 流程中可行的规范
 - 关注 DevOps 指标，优化流程和提高效率

Todo：

 - 进一步完善流程标准和挖掘数据来提高效率和软件质量
 - 采用机器学习来实现基于风险和变更的测试策略
 - 进一步加强质量可视化实现
 - 基于 Moss 的数据整合能力，实现监控一体化
 - 开发 Chrome 插件 Moss Detector，进一步加强用户在 DevOps 中的交互和效率提升
