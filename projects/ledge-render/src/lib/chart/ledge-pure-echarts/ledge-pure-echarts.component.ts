import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'ledge-pure-echarts',
  templateUrl: './ledge-pure-echarts.component.html',
  styleUrls: ['./ledge-pure-echarts.component.scss'],
})
export class LedgePureEchartsComponent implements OnInit, AfterViewInit {
  @Input()
  data: string;

  @ViewChild('chart', {}) reporter: ElementRef;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const mychart = echarts.init(this.reporter.nativeElement);
    try {
      mychart.setOption(JSON.parse(this.data));
    } catch (e) {
      console.error(this.data);
    }
  }
}
