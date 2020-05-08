import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs/tab-group';

import TECH_CHECKLIST from './checklists/technology.json';
import PROCESS_CHECKLIST from './checklists/process.json';
import PEOPLE_CHECKLIST from './checklists/people.json';
import DOMAIN_CHECKLIST from './checklists/domain.json';
import { StorageMap } from '@ngx-pwa/local-storage';

import * as newproject from 'raw-loader!../../../assets/docs/checklists/new-project.md';
import * as agileMD from 'raw-loader!../../../assets/docs/checklists/agile.md';
import * as azureDevOps from 'raw-loader!../../../assets/docs/checklists/devops.md';
import * as gruntworkDevOps from 'raw-loader!../../../assets/docs/checklists/devops-gruntwork.md';
import * as xpDevOps from 'raw-loader!../../../assets/docs/checklists/xp.md';
import * as codeReview from 'raw-loader!../../../assets/docs/checklists/codereview.md';
import * as fe from 'raw-loader!../../../assets/docs/checklists/front-end.md';
import * as devSecOps from 'raw-loader!../../../assets/docs/checklists/devsecops.md';
import * as apiSecurity from 'raw-loader!../../../assets/docs/checklists/api-security.md';
import * as microservices from 'raw-loader!../../../assets/docs/checklists/microservices.md';

import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-checklists',
  templateUrl: './checklists.component.html',
  styleUrls: ['./checklists.component.scss'],
})
export class ChecklistsComponent implements OnInit {
  agileContent = agileMD.default;
  devopsContent = azureDevOps.default;
  gdevopsContent = gruntworkDevOps.default;
  xpContent = xpDevOps.default;
  codeReviewContent = codeReview.default;
  feContent = fe.default;
  devSecOpsContent = devSecOps.default;
  apiSecurityContent = apiSecurity.default;
  msContent = microservices.default;
  npConent = newproject.default;

  selectedTabIndex = 0;

  contentMap = [
    { name: '新项目检查清单', route: 'new-project' },
    { name: '敏捷实践检查清单', route: 'agile-practise' },
    { name: 'DevOps 检查清单（Azure）', route: 'azure-devops' },
    { name: 'DevOps 检查清单（AWS）', route: 'aws-devops' },
    { name: 'DevSecOps 检查清单', route: 'devsecops' },
    { name: '极限编程检查清单', route: 'xp-practise' },
    { name: '代码回顾检查清单', route: 'code-review' },
    { name: 'API 安全性检查清单', route: 'api-security' },
    { name: '前端项目检查清单', route: 'frontend' },
    { name: '微服务生产就绪检查清单', route: 'microservices' },
  ];

  constructor(
    private storage: StorageMap,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((p) => {
      const routeName = p.get('name');
      for (const [index, item] of this.contentMap.entries()) {
        if (item.name === routeName) {
          this.selectedTabIndex = index;
        }
      }
    });
    this.storage.get('checklists.last.index').subscribe((value: string) => {
      if (!!value) {
        this.selectedTabIndex = parseInt(value, 10);
      }
    });
    this.setTitle();
  }

  onTabChanged($event: MatTabChangeEvent) {
    this.selectedTabIndex = $event.index;
    this.setTitle();

    this.router.navigate([
      '/checklists/',
      this.contentMap[this.selectedTabIndex].route,
    ]);
    this.storage
      .set('checklists.last.index', this.selectedTabIndex)
      .subscribe();
  }

  private setTitle() {
    this.title.setTitle(
      this.contentMap[this.selectedTabIndex].name + ' - DevOps 知识平台'
    );
  }
}
