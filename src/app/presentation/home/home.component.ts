import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Atom, HighlightState } from '../../features/periodic-table/shared';
import { Title } from '@angular/platform-browser';
import * as mdData from 'raw-loader!../../../assets/docs/home.md';
import { NavigationEnd, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Contributor {
  name: string;
  link: string;
  work: string;
  title: string;
  avatar: string;
}

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
  contributors: Contributor[] = [
    {
      name: 'Phodal',
      link: 'https://www.phodal.com',
      work: '发起人、主要维护者',
      title: 'ThoughtWorks 高级咨询师',
      avatar:
        'https://avatars3.githubusercontent.com/u/472311?s=460&u=3d7d46bf34e32449b1439178ae7652cf06d130f1&v=4',
    },
    {
      name: '刘宇',
      link: 'https://github.com/LiuuY',
      work: '核心开发、丰富学习案例',
      title: 'ThoughtWorks 高级咨询师',
      avatar:
        'https://avatars0.githubusercontent.com/u/14286374?s=460&u=1933f64247e26812c67ca1c41aa0b7ba23b069f6&v=4',
    },
    {
      name: '吴辰保',
      link: 'https://github.com/chen02xw',
      work: '丰富学习案例',
      title: 'ThoughtWorks 高级咨询师',
      avatar: 'https://avatars3.githubusercontent.com/u/57704189?s=460&v=4',
    },
    {
      name: '毛俊',
      link: 'https://github.com/komamj',
      work: '丰富移动端 DevOps 内容',
      title: 'ThoughtWorks 高级咨询师',
      avatar:
        'https://avatars1.githubusercontent.com/u/20431947?s=400&u=3bb25fac4f0dec4555577f89093729c643e8eb08&v=4',
    },
    {
      name: '于晓南',
      link: 'https://github.com/ConnieYXN',
      work: '项目 QA，创建、维护测试智库',
      title: 'ThoughtWorks 高级咨询师',
      avatar:
        'https://avatars0.githubusercontent.com/u/22843012?s=460&u=6197636e584b6bec7982eccaf220b7bed42ddf0d&v=4',
    },
    {
      name: '郭晋',
      link: 'https://www.behance.net/GUO-JIN',
      work: '用户体验设计',
      title: 'ThoughtWorks 用户体验设计师',
      avatar:
        'https://mir-s3-cdn-cf.behance.net/user/230/09f5c331679359.570378575cc1d.jpg',
    },
    {
      name: '王玲',
      link: 'https://github.com/klxq',
      work: '项目开发人员',
      title: 'ThoughtWorks UI Developer',
      avatar:
        'https://avatars1.githubusercontent.com/u/9253941?s=460&u=8c1be979f965c43ac501a8d871955e0083676d78&v=4',
    },
    {
      name: 'giscafer',
      link: 'https://github.com/giscafer',
      work: '项目开发人员',
      title: '全栈开发工程师',
      avatar:
        'https://avatars0.githubusercontent.com/u/8676711?s=460&u=b88b7ee37574da3b6aef32da9a5986eb82bc4d11&v=4',
    },
    {
      name: 'You',
      link: '',
      title: 'github users',
      work: 'Help us, testing in production, give feedback',
      avatar: '/assets/resources/images/avatar-new.svg',
    },
  ];
  homemd = mdData.default;
  allContributors$: Observable<any>;
  allContributors: any[];

  constructor(title: Title, private router: Router, private http: HttpClient) {
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
}
