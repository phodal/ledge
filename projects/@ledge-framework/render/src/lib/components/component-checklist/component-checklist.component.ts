import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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

  @Output() updateParent = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {

  }

  completeChange($event: MatCheckboxChange) {
    this.updateParent.emit($event.checked);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes.checklists) {
      this.checklists = changes.checklists.currentValue as ChecklistModel[];
    }
  }
}
