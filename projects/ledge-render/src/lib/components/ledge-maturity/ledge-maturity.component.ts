import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LedgeListItem } from '../model/ledge-chart.model';
import { RatingItemModel, RatingListModel } from '../model/rating.model';

@Component({
  selector: 'ledge-maturity',
  templateUrl: './ledge-maturity.component.html',
  styleUrls: ['./ledge-maturity.component.scss']
})
export class LedgeMaturityComponent implements OnInit, OnChanges {
  @Input()
  data: LedgeListItem[];
  chartData: LedgeListItem[];
  ratingData: RatingListModel;

  @Input()
  config: any;
  checklists: any;
  title: any;

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      this.data = changes.data.currentValue;
      this.chartData = this.data;
      this.ratingData = this.data[0].children as any;
    }
  }
}
