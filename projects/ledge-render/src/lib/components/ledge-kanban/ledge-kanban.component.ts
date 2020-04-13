import { Component, Input, OnInit } from '@angular/core';
import { LedgeListItem } from '../model/ledge-chart.model';

@Component({
  selector: 'ledge-kanban',
  templateUrl: './ledge-kanban.component.html',
  styleUrls: ['./ledge-kanban.component.scss']
})
export class LedgeKanbanComponent implements OnInit {
  @Input()
  data: LedgeListItem[];

  @Input()
  config: any;

  constructor() { }

  ngOnInit(): void {
  }

}
