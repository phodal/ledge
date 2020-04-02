import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { LedgeList } from '../../../components/model/ledge-chart.model';

@Component({
  selector: 'ledge-radar',
  templateUrl: './ledge-radar.component.html',
  styleUrls: ['./ledge-radar.component.scss'],
})
export class LedgeRadarComponent implements OnInit {
  @Input()
  data: LedgeList;

  @ViewChild('chart', {}) reporter: ElementRef;

  constructor() {}

  ngOnInit(): void {}
}
