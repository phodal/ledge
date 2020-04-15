import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { ChecklistModel } from '../model/checklist.model';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { LedgeStorageService } from '../../services/ledge-storage.service';

@Component({
  selector: 'component-checklist',
  templateUrl: './component-checklist.component.html',
  styleUrls: ['./component-checklist.component.scss']
})
export class ComponentChecklistComponent implements OnInit, OnChanges {
  @Input() checklists: ChecklistModel[] = [];
  @Input() name: string;

  constructor(private storage: LedgeStorageService) {
  }

  ngOnInit() {
    // const storageChecklist = this.storage.getItem('inception.component-checklist.' + this.name);
    // if (!isEmpty(storageChecklist)) {
    //   this.checklists = storageChecklist;
    // }
  }

  changeTodo($event: any, index: number) {
    // this.storage.setItem('inception.component-checklist.' + this.name, this.checklists);
  }

  completeChange($event: MatCheckboxChange) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes.checklists) {
      this.checklists = changes.checklists.currentValue as ChecklistModel[];
    }
  }
}
