import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import * as mdData from 'raw-loader!../../../assets/docs/home.md';
import { HighlightState } from '../../features/periodic-table/support';
import { TranslateService } from '@ngx-translate/core';
import { contributors } from './contributiors';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  highlightState: HighlightState;
  category: string;
  devOpsExample = `
  \`\`\`table-step
| 项目 / 过程管理 | 配置管理 | 构建  | 测试 / 质量 | 制品 / 部署 | 基础设施 | 沟通协作 | 可视化   |
|---|----|---|---|----|----|----|----|
| Jira          | Gitee   | Maven | Junit      | Ubran code | VMWare  | 招呼     | Tableau |
| Tracker       | Rational ClearCase |  Gradle | Cucumber | Fit2Cloud | OpenShift | 移事通 | Grafana |
| VP            | CMDB | NPM | JMeter     | B9         | Cloud Foundry | | Kibana |
| Confluence    |   Firefly    | Ant   | RobotFramework | JFrog Artifactory | | |  Prometheus |
| ITIL          |    | MSBuild | Protractor | | | | ElasticSearch |
|               |           |  Docker  | Sonar | | | | X-Pack |
|               |           |        | BlackDuck | | | | |

config: {"colors": [{"bg":"#e55852","font":"#b71a09"},{"bg":"#e98832","font":"#c85113"},{"bg":"#f0d668","font":"#b88d0f"},
{"bg":"#a4c9cf","font":"#598893"},{"bg":"#47c0af","font":"#175a54"},
{"bg":"#387fd5","font":"#9ac9f5"},{"bg":"#7753df","font":"#cbb5f8"},{"bg":"#485cde","font":"#a0b1f3"}]}
\`\`\`
    `;

  processTemplate = `
  \`\`\`step-line
  - 源码管理
  - 制品管理
  - 配置管理
  - 数据库自动化
  - 测试
  - 持续集成
  - 监控
  - 分析
  - 智能运维
  - 协作
  \`\`\`

  `;
  users = contributors;

  homemd = mdData.default;
  allContributors$: Observable<any>;
  inViewport = false;

  constructor(
    title: Title,
    private router: Router,
    private http: HttpClient,
    public translate: TranslateService
  ) {
    title.setTitle('Ledge DevOps 知识平台 - DevOps 工具元素周期表');
  }

  setCurrentAtomCategory(category: string) {
    this.category = category;
  }

  ngOnInit(): void {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }

  ngAfterViewInit(): void {
    this.allContributors$ = this.http
      .get('https://api.github.com/repos/phodal/ledge/contributors')
      .pipe();
  }

  show(event: Partial<IntersectionObserverEntry>) {
    if (event.intersectionRatio >= 0.5) {
      this.inViewport = true;
    }
  }
}
