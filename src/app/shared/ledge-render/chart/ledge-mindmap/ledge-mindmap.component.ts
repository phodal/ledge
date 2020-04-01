import { Component, Input, OnInit } from '@angular/core';
import { LedgeTable } from '../../../components/model/ledge-chart.model';

@Component({
  selector: 'ledge-mindmap',
  templateUrl: './ledge-mindmap.component.html',
  styleUrls: ['./ledge-mindmap.component.scss']
})
export class LedgeMindmapComponent implements OnInit {
  @Input()
  data: LedgeTable;

  constructor() { }

  ngOnInit(): void {
  }

}
