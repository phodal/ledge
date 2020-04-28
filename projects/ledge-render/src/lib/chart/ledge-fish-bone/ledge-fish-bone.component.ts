import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { LedgeListItem } from '../../components/model/ledge-chart.model';
import fishbone from './fishbone';
import * as d3 from 'd3';

@Component({
  selector: 'ledge-fish-bone',
  templateUrl: './ledge-fish-bone.component.html',
  styleUrls: ['./ledge-fish-bone.component.scss']
})
export class LedgeFishBoneComponent implements OnInit, AfterViewInit {
  @Input()
  data: LedgeListItem[];

  @Input()
  config: any;

  @ViewChild('chart', {}) chart: ElementRef;

  constructor() {
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    const data = this.data[0];
    console.log(data);
    const fb = fishbone();
    d3.select(this.chart.nativeElement)
      .append('svg')
      .attr('width', 1200)
      .attr('height', 800)
      .datum(data)
      .call(fb.defaultArrow)
      .call(fb);

    fb.force().restart();
  }

}
