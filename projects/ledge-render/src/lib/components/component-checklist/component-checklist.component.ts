import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { ChecklistModel } from '../model/checklist.model';

@Component({
  selector: 'component-checklist',
  templateUrl: './component-checklist.component.html',
  styleUrls: ['./component-checklist.component.scss']
})
export class ComponentChecklistComponent implements OnInit, OnChanges {
  @Input() checklists: ChecklistModel[] = [];
  @Input() name: string;

  constructor() {
  }

  ngOnInit() {

  }

  completeChange($event: MatCheckboxChange) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes.checklists) {
      this.checklists = changes.checklists.currentValue as ChecklistModel[];
    }
  }
}
