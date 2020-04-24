import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LedgeListItem } from '../model/ledge-chart.model';
import { CheckItem, ChecklistModel } from '../model/checklist.model';

@Component({
  selector: 'ledge-checklist',
  templateUrl: './ledge-checklist.component.html',
  styleUrls: ['./ledge-checklist.component.scss']
})
export class LedgeChecklistComponent implements OnInit, OnChanges {
  @Input()
  data: LedgeListItem[];

  @Input()
  config: any;
  checklists: any;
  title: any;

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.renderData();
  }

  private renderData() {
    this.title = encodeURIComponent(this.data[0].name);
    const items = this.data[0].children;
    const checklists: ChecklistModel[] = [];
    for (const item of items) {
      const checklist: ChecklistModel = {
        title: item.name,
        description: '',
        subitems: []
      };

      if ((item as object).hasOwnProperty('checked')) {
        checklist.checked = item.checked;
      }
      for (const child of item.children) {
        const splitName = child.name.split('：');
        const subItem: CheckItem = {
          title: splitName[0],
          description: splitName.length > 1 ? splitName[1] : ''
        };
        if ((child as object).hasOwnProperty('checked')) {
          subItem.checked = child.checked;
        }
        checklist.subitems.push(subItem);
      }
      checklists.push(checklist);
    }
    this.checklists = checklists;
  }
}
