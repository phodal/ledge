# Atlassian



### 基于 AWS 的微服务 PaaS 平台 

 - 运行微服务的一致性容器。AWS EC2 AMI，Docker 或者 Jar
 - 资源设置和管理。CloudFormation
 - 微服务实例之间的自动伸缩和负载均衡。
 - 日志合并和搜索。Fluent -> ElasticSearch -> Kibana
 - 指标收集、合并、报告和告警。AWS CloudWatch + Stackdriver -> PagerDuty -> Kibana
 - AWS 微服务之间的安全网络和基础设施和 Atlassian 数据中心内的现有应用。
 - 零停机时间部署和支持快速回滚。AWS ELB、Auto Scale Group 和 EC2 实例，Route 53 切换。
 - 多个环境以支持不同级别的部署和测试。
    - 域开发
    - 应用开发
    - 预发布
    - 生产环境 
 
来源 《DevOps 架构师行动指南》
