# 招商银行

来源：《[陈展文：招行的 DevOps 和精益研发之路](http://www.idcquan.com/Special/2019trucs/ppt/chenzhanwen.pdf)》

```process-table
| 尝试 | 学习 | 试验 | 试点 | 扩大试点 | 工具支持 | 抽象原则 | 落地实践 | 建立平台 | 持续改进 |
|-|-|-|-|-|-|-|-|-|-|
```

## 过程

 - 2014——初识
   - 初步交流 “DevOps”理念
   - 使用商业的配置工具和自动化编译工具尝试进行自动化编译、每日构建集成等工程实践探索
 - 2015——研究
   - 研究 “DevOps” 理论和实践
   - 与国内领先的敏捷精益咨询公司深入交流 DevOps 在同业实施情况。实地到采用了敏捷转型的公司实地考察 DevOps 实施情况。
   - 参加国内一流技术大会，了解业界最新趋势并与同行交流。
   - 扩大自动化编译、持续集成试点范围，新增试点技术债务管理、自动化部署等实践
 - 2016——起步
   - 总结研究成果，识别招行适用的完整实践集，并在部分系统试点。
   - 改进协同工作平台和版本管理工具，支持敏捷试点、迭代管理、持续集成。
   - 扩大技术债务管理工具覆盖，促进整体技术债务率降低。
 - 2017——加速
   - 建立 DevOps 成熟度模型
   - 推进 DevOps 实践落地
   - 建设 DevOps 综合平台
 - 2018——全面落地
   - 开放平台全部使用 DevOps 流水线平台
   - DevOps 协同工作平台逐步成型
 - 2019 ——持续改进
   - 对标优秀企业、优化实践、持续改进
   - 支撑精益研发体系落地、助力 Fintech 银行建设和数字化转型

## 工具

```process-table
| 项目 / 过程管理 | 配置管理 | 构建  | 测试 / 质量 | 制品 / 部署 | 基础设施 | 沟通协作 | 可视化   |
|---------------|---------|-------|------------|------------|---------|---------|---------|
| Jira          | Gitee   | Maven | Junit      | Ubran code | VMWare  | 招呼     | Tableau |
| Tracker       | Rational ClearCase |  Gradle | Cucumber | Fit2Cloud | OpenShift | 移事通 | Grafana |
| VP            | CMDB | NPM | JMeter     | B9         | Cloud Foundry | | Kibana | 
| Confluence    |   Firefly    | Ant   | RobotFramework | JFrog Artifactory | | |  Prometheus |
| ITIL          |    | MSBuild | Protractor | | | | ElasticSearch |
|               |           |  Docker  | Sonar | | | | X-Pack |
|               |           |        | BlackDuck | | | | |
```
