# DevOps 读书雷达

```tech-radar
 - 文化
   - adopt
     - 《第五项修炼: 学习组织的技术和实践》
     - 《奈飞文化手册》
     - 《管理 3.0： 培养和提升技术领导力》
   - trail
     - 《团队协作的五大障碍》
     - 《团队之美》
     - 《精益企业》
   - assess
     - 《丰田模式：精益制造的 14 项管理原则》
   - hold
     - 《凤凰项目：一个IT运维的传奇故事》
 - 流程
   - adopt
     - 《持续交付》
     - 《精益软件度量：实践者的观察与思考》
   - trail
     - 《Jenkins 权威指南》
     - 《持续交付 2.0： 业务引领的DevOps精要》
   - assess
   - hold
     - 《发布！软件的设计与部署》
     - 《发布！设计与部署稳定的分布式系统（第2版）》
 - 实践
   - adopt
     - 《基础设施即代码：云服务器管理》
     - 《测试驱动开发：实战与模式解析》
     - 《微服务架构设计》
     - 《领域驱动设计模式、原理与实践》
     - 《SRE：Google 运维解密》
   - trail
     - 《演进式架构》
   - assess
     - 《修改代码的艺术》
   - hold
     - 《重构：改善既有代码的设计》
     - 《看板实战》
     - 《敏捷软件测试：测试人员与敏捷团队的实践指南》
 - 实施
   - adopt
    - 《Effective DevOps》
    - 《DevOps实践指南》
    - 《Java 持续交付》
    - 《DevOps实施手册 在多级 IT 企业中使用 DevOps》
    - 《领域驱动设计：软件核心复杂性应对之道》
   - trail
    - 《Accelerate》
    - 《DevOps 最佳实践》
    - 《学习敏捷开发》
   - assess
    - 《SRE：Google 运维解密》
   - hold
    - 《DevOps 实践》

config: {"hiddenLegend": true}
```

## 实践

《SRE：Google 运维解密》 这本书中，Google SRE 的关键成员解释了他们是如何对软件生命周期进行整体性关注的，以及为什么这样做能够帮助 Google 成功地构建、部署、监控和运维世界上现在的最大的软件系统。

## 实施

《Accelerate》 提出了 [加速：高效 DevOps 的技术/管理实践](/practise#加速：高效-devops-的技术管理实践)

《DevOps 实践》 这本书我并不推荐，一个是时间太早：2016 年，内容不合时宜；另外一个是，大部分内容网上都有。不过呢，手法上差不多是这样的。

# 大会 Presentation

[SRECon](https://www.usenix.org/srecon)

# DevOps 厂商案例

- [AWS 客户成功案例](https://aws.amazon.com/cn/solutions/case-studies/)
- [腾讯云云开发案例](https://mp.weixin.qq.com/s/jcKEYinsdyKef9xGbHLGiw)

Google DevOps Tools:

 - https://github.com/jhuangtw/xg2xg
 - https://github.com/google/startup-os

# 文章

## 敏捷

- 《[ThoughtWorks 敏捷实践关键清单 v0.1.1](https://cloud.tencent.com/developer/article/1558754)》

## DevOps

- 《[大型银行敏捷 & DevOps 转型之快速启动](https://insights.thoughtworks.cn/quick-start-agile-devops-transformation/)》
- 《[DevOps 团队之殇](http://insights.thoughtworkers.org/what-does-the-devops-team-has-delivered/)》
- 《[DevOps 发展的 9 个趋势](http://insights.thoughtworkers.org/nine-trends-of-devops/)》

# 图书

- 《[DevOps 实践指南](https://book.douban.com/subject/30186150/)》

# 工具

## 测试数据管理 

### 数据脱敏

> 差分隐私（英语：differential privacy）是密码学中的一种手段，旨在提供一种当从统计数据库查询时，最大化数据查询的准确性，同时最大限度减少识别其记录的机会。

[Google Differential Privacy](https://github.com/google/differential-privacy)

[Open Differential Privacy](https://github.com/opendifferentialprivacy/)


# DevOps 技术栈知识图谱

### DevOps

来源：[https://github.com/raycad/devops-roadmap](https://github.com/raycad/devops-roadmap)

```tree
 - 技术栈知识图谱
   - 源码管理
     - 源码管理服务
       - Gitlab
       - Gitea
       - Gogs
   - 前端
     - 框架
       - React
       - Angular
       - Vue
     - 构建工具
       - Webpack + Gulp
     - 单元测试
       - Jest
       - Jasmine
       - Karma
   - 后端
     - 语言和框架
       - Golang
         - Gin
         - Echo
       - Java
         - Spring Boot
       - Node.js
         - Express
         - Koa
         - Next.js
       - Python
         - Django
         - Flask
     - IAM
       - OAuth
       - JWT
     - 消息代理
       - Kafka
       - RabbitMQ
       - ZeroMQ
     - Web 服务器
       - Apache
       - Nginx
     - Mock API
       - JSON Server
       - Moco
       - Mockoon
     - API 文档
       - Swagger
   - 数据库
     - 关系型数据库
       - PostreSQL
       - MariaDB
       - MySQL
     - 非关系型数据库
       - 文档存储
         - MongoDB
         - RethinkDB
       - 键值存储
         - Redis
         - Memcached
       - 搜索引擎
         - ElasticSearch
         - Solr
       - 时序
         - InfluxDB
         - Graphite
       - 图形数据库
         - Neo4j
   - API 网关
     - Traefik
     - Kong
     - Zuul
   - 云计算
     - OpenStack
     - CloudStack
   - 服务测试
     - API 测试
       - jMeter
       - Postman
     - 性能测试
       - nGrinder
       - jMeter
       - wrk
     - 自动化 E2E 测试
       - Selenium
       - Cucumber
   - 运维
     - 容器化
       - Docker
     - 编排
       - Kubernetes
     - CI/CD
       - Jenkins
       - GoCD
       - Drone
     - 配置管理
       - Ansible
       - Chef
     - 监控
       - Grafana
       - Nagios
       - Icingga
     - 日志管理
       - ELK
       - Fluentd
       - Apache Flume
   - 大数据
     - 数据流
       - Apache Spark Streaming
       - Flink
     - 数据处理
       - Apache Spark
       - Apache Storm
     - 数据集成（ETL)
       - Apache NiFi
       - Pentaho

config: {"height": 1200, "width": 1200}
```
