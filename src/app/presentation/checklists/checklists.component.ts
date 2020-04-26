import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs/tab-group';

import TECH_CHECKLIST from './checklists/technology.json';
import PROCESS_CHECKLIST from './checklists/process.json';
import PEOPLE_CHECKLIST from './checklists/people.json';
import DOMAIN_CHECKLIST from './checklists/domain.json';
import { StorageMap } from '@ngx-pwa/local-storage';

import * as agileMD from 'raw-loader!../../../assets/docs/checklists/agile.md';
import * as azureDevOps from 'raw-loader!../../../assets/docs/checklists/devops.md';
import * as gruntworkDevOps from 'raw-loader!../../../assets/docs/checklists/devops-gruntwork.md';
import * as xpDevOps from 'raw-loader!../../../assets/docs/checklists/xp.md';
import * as codeReview from 'raw-loader!../../../assets/docs/checklists/codereview.md';
import * as fe from 'raw-loader!../../../assets/docs/checklists/front-end.md';
import * as devSecOps from 'raw-loader!../../../assets/docs/checklists/devsecops.md';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-checklists',
  templateUrl: './checklists.component.html',
  styleUrls: ['./checklists.component.scss'],
})
export class ChecklistsComponent implements OnInit {
  techChecklist: any = TECH_CHECKLIST;
  processChecklist: any = PROCESS_CHECKLIST;
  peopleChecklist: any = PEOPLE_CHECKLIST;
  domainChecklist: any = DOMAIN_CHECKLIST;

  agileContent = agileMD.default;
  devopsContent = azureDevOps.default;
  gdevopsContent = gruntworkDevOps.default;
  xpContent = xpDevOps.default;
  codeReviewContent = codeReview.default;
  feContent = fe.default;
  devSecOpsContent = devSecOps.default;

  selectedTabIndex = 0;

  contentMap = [
    { name: '新项目检查清单' },
    { name: '敏捷实践检查清单' },
    { name: 'DevOps 检查清单（Azure）' },
    { name: 'DevOps 检查清单（AWS）' },
    { name: 'DevSecOps 检查清单' },
    { name: '极限编程检查清单' },
    { name: '代码回顾检查清单' },
    { name: '前端项目检查清单' },
  ];

  constructor(
    private storage: StorageMap,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((p) => {
      this.selectedTabIndex = Number(p.get('selectedIndex'));
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

    this.router.navigate(['/checklists/', this.selectedTabIndex]);
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
