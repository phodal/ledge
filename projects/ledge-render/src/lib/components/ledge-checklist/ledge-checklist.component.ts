import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LedgeListItem } from '../model/ledge-chart.model';

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

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.renderData();
  }

  private renderData() {
    console.log(this.data);
  }
}
