# DaoCloud

来源：《[持续交付演化之路:从 DevOps 到 DevSecOps](http://www.idcquan.com/Special/2019trucs/ppt/wangtianqing.pdf)》

### DevOps 典型工具链

```table-step
| 项目管理 | 持续集成 | 持续部署 | 发布 | 质量 | 测试 |  运维 | 协作 |
|---|---|---|---|---|---|---|---|
| 任务管理：Jira | 源码：GitHub 企业版 | 发布：DCS | 制品仓库：Nexus| 代码质量管理：SonarQube | 单元测试：JUnit | 应用监控： APM | 知识库：Confluence |
| 问题管理：Jira | 代码评审：GitHub 企业版 |    | | 代码安全扫描： CheckMarx | 接口测试: RTF | 系统运维：DCE | |
|||||||压力测试：JMeter|日志管理: GrayLog||

config: { "rowHeight": "240px", "colors": [{"bg":"#e55852","font":"#b71a09"},{"bg":"#e98832","font":"#c85113"},{"bg":"#f0d668","font":"#b88d0f"},{"bg":"#a4c9cf","font":"#598893"},{"bg":"#47c0af","font":"#175a54"},{"bg":"#387fd5","font":"#9ac9f5"},{"bg":"#7753df","font":"#cbb5f8"},{"bg":"#00a2a1","font":"#3de8e7"}]}
```

### DevSecOps 典型工具链

```process-card
| 源码管理 | 制品管理 | 分析（运行时） |
|--------|---------|----------|
| 代码质量分析：SonarQube | 依赖包分析：jFrog Xray * | 流量可观测性：SkyWalking |
| 代码安全扫描：CheckMarx* | 镜像安全扫描：Calir | 流量安全控制：Istio |
| | | TwistLock * |

config: { "rowHeight": "240px", "colors": [{"bg":"#a4c9cf","font":"#598893"},{"bg":"#47c0af","font":"#175a54"},{"bg":"#387fd5","font":"#9ac9f5"},{"bg":"#7753df","font":"#cbb5f8"},{"bg":"#00a2a1","font":"#3de8e7"}]}
```
