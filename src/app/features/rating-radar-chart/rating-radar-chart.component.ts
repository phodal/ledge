import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MarkdownListModel } from '../../shared/model/markdown.model';
import * as echarts from 'echarts';
import ChartOptions from '../../shared/support/chart-options';
import MarkdownHelper from '../../shared/model/markdown.helper';

@Component({
  selector: 'rating-radar-chart',
  templateUrl: './rating-radar-chart.component.html',
  styleUrls: ['./rating-radar-chart.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingRadarChartComponent),
      multi: true,
    },
  ],
})
export class RatingRadarChartComponent
  implements OnInit, AfterViewInit, ControlValueAccessor {
  @ViewChild('baseElement', {}) baseElement: ElementRef;
  @ViewChild('chart', {}) chartEl: ElementRef;

  @Input()
  instanceKey: string;

  items: any[];
  data: any[] = [];
  value: any;
  disabled: boolean;

  constructor() {}

  ngOnInit() {}

  onChange(value: any) {
    this.value = value;
  }

  onTouched() {}

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    this.value = obj;
    if (!this.value) {
      return;
    }

    this.items = this.value;
    this.render();
  }

  ngAfterViewInit(): void {}

  updateModel($event: any) {
    this.onChange($event);
  }

  private taskToData() {
    const current: any[] = [];
    for (const task of this.items) {
      const item: MarkdownListModel = task.item;
      MarkdownHelper.buildRatingValue(item);

      current.push({ name: item.text });
    }

    return current;
  }

  render() {
    if (!this.items) {
      return;
    }
    this.data = this.taskToData();
    const myChart = echarts.init(this.chartEl.nativeElement);
    const option = ChartOptions.buildRadarChartOption({
      name: '',
      children: this.data,
    });
    myChart.setOption(option);
  }
}
