import { Component, Input, OnInit } from '@angular/core';
import { LedgeListItem } from '../model/ledge-chart.model';

@Component({
  selector: 'ledge-dev-process',
  templateUrl: './ledge-dev-process.component.html',
  styleUrls: ['./ledge-dev-process.component.scss']
})
export class LedgeDevProcessComponent implements OnInit {
  @Input()
  data: LedgeListItem[];

  @Input()
  config: any;

  constructor() { }

  ngOnInit(): void {
    console.log(this.data);
  }
}
