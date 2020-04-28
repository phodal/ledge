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
    const fb = fishbone();
    let width = 1200;
    let height = 800;

    if (this.config) {
      if (this.config.width) {
        width = this.config.width;
      }
      if (this.config.height) {
        height = this.config.height;
      }
    }

    fb.setWidthHeight(width, height);
    d3.select(this.chart.nativeElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .datum(data)
      .call(fb.defaultArrow)
      .call(fb);

    fb.force().restart();
  }

}
