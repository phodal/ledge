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
import { isScullyRunning } from '@scullyio/ng-lib';

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

  private defaultButtons: any = [
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

  private completeButton = {
    classes: 'complete-button',
    text: 'Finish',
    action() {
      return this.complete();
    },
  };
  steps = [
    {
      title: '欢迎来到 Ledge 知识平台，开启你的提升之旅',
      text: `Ledge （源于 Know-Ledge，意指承载物） 是一个开源的 DevOps 知识平台，它包含了各种最佳实践、原则与模式、实施手册、度量、工具，用于帮助您的企业在数字化时代更好地前进，还有 DevOps 转型。`,
      attachTo: {
        element: '.ledge-title',
        on: 'bottom',
      },
      buttons: this.defaultButtons,
      id: 'creating',
    },
    {
      title: '元素周期表',
      text: `『元素周期表』是我们整理了常用的 DevOps 流程中的工具产出的一个工具，用于帮助你设计和指导 DevOps 流程设计与实施。`,
      attachTo: {
        element: '.intro-periodic',
        on: 'top',
      },
      buttons: this.defaultButtons,
      id: 'pattern',
    },
    {
      title: '案例学习',
      text: `在技术社区这个丰富的知识库中，我们总结了传统企业走向 DevOps 的经验，并浓缩到易于使用的内容和材料中。`,
      attachTo: {
        element: '.intro-case',
        on: 'top',
      },
      buttons: this.defaultButtons,
      id: 'case',
    },
    {
      title: '模型与原则',
      text: `『模型与原则』包含了各种实践背后的思想和模式，用于指导 DevOps 教练、技术人员、管理者实践 DevOps 和对应的实践，如流畅度模型、学习型组织等。`,
      attachTo: {
        element: '.intro-pattern',
        on: 'bottom',
      },
      buttons: this.defaultButtons,
      id: 'pattern',
    },
    {
      title: '最佳实践',
      text: `『最佳实践』是 Ledge 的精华所在，它提炼了一系列的最佳、最优软件开发实践，用于帮助你完善自身的知识体系。`,
      attachTo: {
        element: '.intro-practise',
        on: 'bottom',
      },
      buttons: this.defaultButtons,
      id: 'practise',
    },
    {
      title: '实施手册',
      text: `『实施手册』是一个完整的 DevOps 实施指导手册，用于手把手带你进入 DevOps 世界。`,
      attachTo: {
        element: '.intro-manual',
        on: 'bottom',
      },
      buttons: this.defaultButtons,
      id: 'manual',
    },
    {
      title: '工具',
      text: `除了，将常用的工具提炼到这个项目中。我们还将 Ledge 中一系列的模式和原则，提取成工具放置到这个项目中。`,
      attachTo: {
        element: '.intro-tool',
        on: 'bottom',
      },
      buttons: this.defaultButtons,
      id: 'tool',
    },
    {
      title: '开源 + 开放 + 协作 + 透明',
      text: `如果你在使用过程中，遇到任何问题或者对我们有任何意见，欢迎向我们提出反馈！让我们一起成长！`,
      attachTo: {
        element: '.home-link',
        on: 'bottom',
      },
      buttons: [...this.defaultButtons, this.completeButton],
      id: 'github',
    },
  ];

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
    this.shepherdService.addSteps(this.steps);

    if (!isScullyRunning()) {
      const doneKey = 'intro.hadDone';
      this.storage.get(doneKey).subscribe((value: boolean) => {
        if (!value) {
          this.shepherdService.start();
          this.storage.set(doneKey, true).subscribe(() => {});
        }
      });
    }
  }

  show(event: Partial<IntersectionObserverEntry>) {
    if (event.intersectionRatio >= 0.5) {
      this.inViewport = true;
    }
  }
}
