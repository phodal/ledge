import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { LedgeList } from '../../../components/model/ledge-chart.model';

@Component({
  selector: 'ledge-pyramid',
  templateUrl: './ledge-pyramid.component.html',
  styleUrls: ['./ledge-pyramid.component.scss'],
})
export class LedgePyramidComponent implements OnInit {
  @Input()
  data: LedgeList;

  @ViewChild('chart', {}) reporter: ElementRef;

  constructor() {}

  ngOnInit(): void {}
}
