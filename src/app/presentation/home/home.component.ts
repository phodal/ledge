import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import * as mdData from 'raw-loader!../../../assets/docs/home.md';
import { HighlightState } from '../../features/periodic-table/support';
import { contributors } from './contributiors';
import { ShepherdService } from 'angular-shepherd';
import { StorageMap } from '@ngx-pwa/local-storage';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  constructor(
    title: Title,
    private router: Router,
    private http: HttpClient,
    private storage: StorageMap,
    private shepherdService: ShepherdService,
    public translate: TranslateService
  ) {
    title.setTitle('DevOps 工具元素周期表 - Ledge DevOps 知识平台');
  }

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

config: {"rowHeight": "350px", "colors": [{"bg":"#e55852","font":"#b71a09"},{"bg":"#e98832","font":"#c85113"},
{"bg":"#f0d668","font":"#b88d0f"},{"bg":"#a4c9cf","font":"#598893"},{"bg":"#47c0af","font":"#175a54"},
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

  private defaultButtons = [
    {
      action() {
        return this.back();
      },
      classes: 'shepherd-button-secondary',
      text: 'Back',
    },
    {
      action() {
        return this.next();
      },
      text: 'Next',
    },
  ];

  private firstStep = {
    title: '欢迎来到 Ledge 知识平台，开启你的提升之旅',
    text: `Ledge （源于 Know-Ledge，意指承载物），它包含了各种最佳实践、原则与模式、实施手册、度量、工具，用于帮助您的企业在数字化时代更好地前进，还有 DevOps 转型。`,
    attachTo: {
      element: '.ledge-title',
      on: 'bottom',
    },
    buttons: this.defaultButtons,
    id: 'creating',
  };

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

    this.shepherdService.defaultStepOptions = {
      cancelIcon: {
        enabled: true,
      },
    };
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps([this.firstStep]);
    this.shepherdService.start();
  }

  show(event: Partial<IntersectionObserverEntry>) {
    if (event.intersectionRatio >= 0.5) {
      this.inViewport = true;
    }
  }
}
