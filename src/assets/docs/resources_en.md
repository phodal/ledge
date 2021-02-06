# DevOps Reading Radar 

```tech-radar
 - Culture
   - adopt
     - The Fifth Discipline：The Art and Practice of the Learning Organization
     - Powerful: Building a Culture of Freedom and Responsibility
     - Management 3.0: Leading Agile Developers, Developing Agile Leaders
   - trail
     - The Five Dysfunctions of a Team
     - Beautiful Teams
     - Lean Enterprise: Adopting Continuous Delivery,DevOps,and Lean Startup at Scale
   - assess
     -  The Toyota Way 14 Management Principles from the World's Greatest Manufacturer
   - hold
     - The Phoenix Project: A Novel about IT, DevOps, and Helping Your Business Win
 - Process
   - adopt
     - Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation
     - Lean Software Measurement: Observation and Thinking of Practitioners
   - trail
     -  Jenkins: The Definitive Guid
     - Continuous Delivery 2.0
   - assess
   - hold
     - Release It!: Design and Deploy Production-Ready Software
     - Release It!: Design and Deploy Production-Ready Software, Second Edition
 - Practice
   - adopt
     - Infrastructure as Code: Managing Servers in the Cloud
     - Test-Driven Development: by Example
     - Microservices Patterns:With Examples in Java
     - Patterns, Principles, and Practices of Domain-Driven Design
     - Site Reliability Engineering: How Google Runs Production Systems
   - trail
     - Building Evolutionary Architectures
   - assess
     - Working Effectively with Legacy Code
   - hold
     - Refactoring: Improving the Design of Existing Code
     - Kanban in Action
     - Agile Testing: A Practical Guide for Testers and Agile Teams
 - Adoption
   - adopt
    - Effective DevOps
    - The DevOps Handbook: How to Create World-Class Agility, Reliability, and Security in Technology Organizations
    - Continuous Delivery in Java
    - The DevOps Adoption Playbook: A Guide to Adopting DevOps in a Multi-Speed IT Enterprise
    - Domain-Driven Design: Tackling Complexity in the Heart of Software
   - trail
    - Accelerate
    - DevOps Best Practices
    - Learning Agile
   - assess
    - Site Reliability Engineering: How Google Runs Production Systems
   - hold
    - DevOps Practices

config: {"hiddenLegend": true}
```

## Practice

Site Reliability Engineering: How Google Runs Production Systems: In this collection of essays and articles, key members of Google’s Site Reliability Team explain how and why their commitment to the entire lifecycle has enabled the company to successfully build, deploy, monitor, and maintain some of the largest software systems in the world. You’ll learn the principles and practices that enable Google engineers to make systems more scalable, reliable, and efficient—lessons directly applicable to your organization.

## Adoption

Accelerate proposed [Accelerate: The Science of Lean Software and DevOps: Building and Scaling High Performing Technology Organizations](/practise#加速：高效-devops-的技术管理实践)

DevOps Practices is not recommened 1) too old: published in 2016 2) all content are available in Internet

# Conference Presentation

[SRECon](https://www.usenix.org/srecon)

# DevOps Case Studies

- [AWS Case Studies](https://aws.amazon.com/cn/solutions/case-studies/)
- [Tecent Cloud Case Studies](https://mp.weixin.qq.com/s/jcKEYinsdyKef9xGbHLGiw)

# Articles

## Agile

- 《[ThoughtWorks 敏捷实践关键清单 v0.1.1](https://cloud.tencent.com/developer/article/1558754)》

## DevOps

- 《[大型银行敏捷 & DevOps 转型之快速启动](https://insights.thoughtworks.cn/quick-start-agile-devops-transformation/)》
- 《[DevOps 团队之殇](http://insights.thoughtworkers.org/what-does-the-devops-team-has-delivered/)》
- 《[DevOps 发展的 9 个趋势](http://insights.thoughtworkers.org/nine-trends-of-devops/)》

# Book

- [The DevOps Handbook: How to Create World-Class Agility, Reliability, and Security in Technology Organizations](https://book.douban.com/subject/30186150/)》

# Tool

## Test Data Management 

### Data desensitization

> Differential privacy is a system for publicly sharing information about a dataset by describing the patterns of groups within the dataset while withholding information about individuals in the dataset. The idea behind differential privacy is that if the effect of making an arbitrary single substitution in the database is small enough, the query result cannot be used to infer much about any single individual, and therefore provides privacy.

[Google Differential Privacy](https://github.com/google/differential-privacy)

[Open Differential Privacy](https://github.com/opendifferentialprivacy/)


# DevOps Roadmap

### DevOps

Source: [https://github.com/raycad/devops-roadmap](https://github.com/raycad/devops-roadmap)

```tree
 - Roadmao
   - Source Code Management
     - Source Code Management Service
       - Gitlab
       - Gitea
       - Gogs
   - Front-End
     - Frameworks
       - React
       - Angular
       - Vue
     - Build Tools
       - Webpack + Gulp
     - Unit Testing
       - Jest
       - Jasmine
       - Karma
   - Back-End
     - Language & Frameworks
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
     - Message Brokers
       - Kafka
       - RabbitMQ
       - ZeroMQ
     - Web Server
       - Apache
       - Nginx
     - Mock API
       - JSON Server
       - Moco
       - Mockoon
     - API Document
       - Swagger
   - Databases
     - RDBMS
       - PostreSQL
       - MariaDB
       - MySQL
     - NoSQL
       - Document Store
         - MongoDB
         - RethinkDB
       - Key-Value Store
         - Redis
         - Memcached
       - Search Engines
         - ElasticSearch
         - Solr
       - Time Series
         - InfluxDB
         - Graphite
       - Graph DBMS
         - Neo4j
   - API Gateway
     - Traefik
     - Kong
     - Zuul
   - Cloud Computing
     - OpenStack
     - CloudStack
   - Service Testing
     - API Testing
       - jMeter
       - Postman
     - Performance Testing
       - nGrinder
       - jMeter
       - wrk
     - Automation Testing
       - Selenium
       - Cucumber
   - Operations
     - Containerization
       - Docker
     - Orchestration
       - Kubernetes
     - CI/CD
       - Jenkins
       - GoCD
       - Drone
     - Configuration Management
       - Ansible
       - Chef
     - Monitoring
       - Grafana
       - Nagios
       - Icingga
     - Log Management
       - ELK
       - Fluentd
       - Apache Flume
   - Big Data
     - Data Streaming
       - Apache Spark Streaming
       - Flink
     - Data Processing
       - Apache Spark
       - Apache Storm
     - Data Integration (ETL)
       - Apache NiFi
       - Pentaho

config: {"height": 1200, "width": 1200}
```
