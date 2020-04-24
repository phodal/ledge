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

  constructor(
    private storage: StorageMap,
    private activatedRoute: ActivatedRoute,
    private router: Router
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
  }

  onTabChanged($event: MatTabChangeEvent) {
    this.selectedTabIndex = $event.index;
    this.router.navigate(['/checklists/', this.selectedTabIndex]);
    this.storage
      .set('checklists.last.index', this.selectedTabIndex)
      .subscribe();
  }
}
