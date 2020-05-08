import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LedgeListItem } from '../model/ledge-chart.model';

@Component({
  selector: 'ledge-maturity',
  templateUrl: './ledge-maturity.component.html',
  styleUrls: ['./ledge-maturity.component.scss']
})
export class LedgeMaturityComponent implements OnInit, OnChanges {
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

  }
}
