# DaoCloud

来源：《[持续交付演化之路:从 DevOps 到 DevSecOps](http://www.idcquan.com/Special/2019trucs/ppt/wangtianqing.pdf)》

### DevOps 典型工具链

```process-table
| 项目管理 | 持续集成 | 持续部署 | 发布 | 质量 | 测试 |  运维 | 协作 |   
|---|---|---|---|---|---|---|---|
| 任务管理：Jira | 源码：GitHub 企业版 | 发布：DCS | 制品仓库：Nexus| 代码质量管理：SonarQube | 单元测试：JUnit | 应用监控： APM | 知识库：Confluence |  
| 问题管理：Jira | 代码评审：GitHub 企业版 |    | | 代码安全扫描： CheckMarx | 接口测试: RTF | 系统运维：DCE | |
|||||||压力测试：JMeter|日志管理: GrayLog||
```

### DevSecOps 典型工具链

```process-table
| 源码管理 | 制品管理 | 分析（运行时） |
|--------|---------|----------|
| 代码质量分析：SonarQube | 依赖包分析：jFrog Xray * | 流量可观测性：SkyWalking | 
| 代码安全扫描：CheckMarx* | 镜像安全扫描：Calir | 流量安全控制：Istio |
| | | TwistLock * |
```
