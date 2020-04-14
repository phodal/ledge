import { Component, OnInit } from '@angular/core';
import TECH_CHECKLIST from './checklists/technology.json';
import PROCESS_CHECKLIST from './checklists/process.json';
import PEOPLE_CHECKLIST from './checklists/people.json';
import DOMAIN_CHECKLIST from './checklists/domain.json';

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

  constructor() {}

  ngOnInit(): void {}
}
