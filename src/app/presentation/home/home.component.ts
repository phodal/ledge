import { Component, OnInit } from '@angular/core';
import { HighlightState } from '../../features/shared';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  highlightState: HighlightState;
  category: string;
  devOpsExample = `
| 项目 / 过程管理 | 配置管理 | 构建  | 测试 / 质量 | 制品 / 部署 | 基础设施 | 沟通协作 | 可视化   |
|---|----|---|---|----|----|----|----|
| Jira          | Gitee   | Maven | Junit      | Ubran code | VMWare  | 招呼     | Tableau |
| Tracker       | Rational ClearCase |  Gradle | Cucumber | Fit2Cloud | OpenShift | 移事通 | Grafana |
| VP            | CMDB | NPM | JMeter     | B9         | Cloud Foundry | | Kibana |
| Confluence    |   Firefly    | Ant   | RobotFramework | JFrog Artifactory | | |  Prometheus |
| ITIL          |    | MSBuild | Protractor | | | | ElasticSearch |
|               |           |  Docker  | Sonar | | | | X-Pack |
|               |           |        | BlackDuck | | | | |
    `;

  processTemplate = `
|源码管理|制品管理|配置管理|数据库自动化|测试|持续集成|监控|分析|智能运维| 协作|
|---|---|---|---|---|---|---|---|---|---|
  `;

  constructor(title: Title) {
    title.setTitle('DevOps 知识平台 Ledge - Periodic Table');
  }

  setCurrentAtomCategory(category: string) {
    this.category = category;
  }

  ngOnInit(): void {
  }
}
