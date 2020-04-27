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
    // const fb = fishbone([], []);
    // fb.call(this, d3);
    const data = {
      name: 'Quality',
      children: [
        {
          name: 'Machine',
          children: [
            {name: 'Mill'},
            {name: 'Mixer'},
            {name: 'Metal Lathe'}
          ]
        }
      ]
    };

    d3.select(this.chart.nativeElement).select('svg')
      .datum(data)
      .call(fishbone);
  }

}
