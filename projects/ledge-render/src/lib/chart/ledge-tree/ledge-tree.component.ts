import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { LedgeListItem } from '../../components/model/ledge-chart.model';

@Component({
  selector: 'ledge-tree',
  templateUrl: './ledge-tree.component.html',
  styleUrls: ['./ledge-tree.component.scss']
})
export class LedgeTreeComponent implements OnInit, OnChanges {
  @Input()
  data: LedgeListItem[];

  @Input()
  config: any;

  @ViewChild('chart', {}) chartEl: ElementRef;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      this.data = changes.data.currentValue;
      setTimeout(() => {
        this.render();
      });
    }
  }

  private render() {
    const chartElement = this.chartEl.nativeElement;
  }
}
