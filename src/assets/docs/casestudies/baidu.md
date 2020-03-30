# 百度

## AIOps

来源：《[运维AI时代 百度如何构建AIOps体系 ](https://myslide.cn/slides/16154)》

### 百度运维技术演进

```process-step
 - 基础运维平台的历史阶段
   - 2008 ~ 2012，统一 + 自动化
   - 服务树、权限管理、机器管理、数据管理
   - 监控系统、部署系统、初始化系统
   - 任务管理系统、名字服务……
 - 开放运维平台的历史阶段
   - 2012 ~ 2014, API + 可扩展
   - 可编码的监控
   - 可配置的部署
   - 开放的名字服务
 - 百度云智能运维
   - 2014 至今，数据 + 算法 -> AIOps
   - 数据建设和智能监控入手（异常检测、根因分析）
   - 逐渐覆盖 智能 故障管理/变更管理/容量管理/服务咨询
```

三个核心：
 - 数据：运维数据仓库 & 运维知识库
 - 工程：运维大数据平台 & 运维工程研发框架
 - 策略：运维策略算法平台 & 运维大脑
 
### 智能化运维能力分级

todo：这有一个表

#### AIOps 实现路径

```process-step
 - level 0：No Automation
   - 手工上线
   - 手工处理故障
   - 人工服务咨询
 - level 1：OP Assitance
   - Web 化上线
   - 预案脚本
   - CMDB
 - level 2：Partial Automation
   - 自动化上线
   - 自动预案止损
   - 问答机器人
 - level 3：Conditional Intelligent
   - 弹性扩缩容
   - 智能流量调度 
   - ChatOps
 - level 4：High Intelligent
   - 无人值守变更 
   - 智能 Oncall 
   - 智能服务台
 - level 5：Full Intelligent
   - 智能运维 
```
