import { Component, Input, OnInit } from '@angular/core';
import { LedgeList } from '../../components/model/ledge-chart.model';

@Component({
  selector: 'ledge-tech-radar',
  templateUrl: './ledge-tech-radar.component.html',
  styleUrls: ['./ledge-tech-radar.component.scss']
})
export class LedgeTechRadarComponent implements OnInit {
  @Input()
  data: LedgeList;

  @Input()
  config: any;

  constructor() { }

  ngOnInit(): void {
  }

}
