import { Component, OnInit } from '@angular/core';
import * as TECH_CHECKLIST from './checklists/technology.json';

@Component({
  selector: 'app-checklists',
  templateUrl: './checklists.component.html',
  styleUrls: ['./checklists.component.scss'],
})
export class ChecklistsComponent implements OnInit {
  techChecklist: any = TECH_CHECKLIST;

  constructor() {}

  ngOnInit(): void {}
}
