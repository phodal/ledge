import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs/tab-group';

import TECH_CHECKLIST from './checklists/technology.json';
import PROCESS_CHECKLIST from './checklists/process.json';
import PEOPLE_CHECKLIST from './checklists/people.json';
import DOMAIN_CHECKLIST from './checklists/domain.json';
import { StorageMap } from '@ngx-pwa/local-storage';

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

  selectedTabIndex = 0;

  constructor(private storage: StorageMap) {}

  ngOnInit(): void {
    this.storage.get('checklists.last.index').subscribe((value: string) => {
      console.log(value);
      if (!!value) {
        this.selectedTabIndex = parseInt(value, 10);
      }
    });
  }

  onTabChanged($event: MatTabChangeEvent) {
    this.selectedTabIndex = $event.index;
    this.storage
      .set('checklists.last.index', this.selectedTabIndex)
      .subscribe();
  }
}
