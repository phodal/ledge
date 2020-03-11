import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'component-process-table',
  templateUrl: './process-table.component.html',
  styleUrls: ['./process-table.component.scss']
})
export class ProcessTableComponent implements OnInit {
  @Input()
  data: [][];

  constructor() { }

  ngOnInit(): void {
  }
}
