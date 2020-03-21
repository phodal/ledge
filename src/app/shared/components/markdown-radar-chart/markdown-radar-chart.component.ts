import { AfterViewInit, Component, ElementRef, forwardRef, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import MarkdownHelper from '../model/markdown.helper';
import { MarkdownListModel } from '../model/markdown.model';

@Component({
  selector: 'component-markdown-radar-chart',
  templateUrl: './markdown-radar-chart.component.html',
  styleUrls: ['./markdown-radar-chart.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MarkdownRadarChartComponent),
      multi: true
    }
  ]
})
export class MarkdownRadarChartComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  @ViewChild('baseElement', {}) baseElement: ElementRef;
  items: any[];
  data: any[] = [];
  value: any;
  private disabled: boolean;

  constructor() {
  }

  ngOnInit() {
  }

  onChange(value: any) {

  }

  onTouched() {
  }

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

  ngAfterViewInit(): void {

  }

  updateModel($event: any) {
    this.onChange($event);
  }

  private taskToData() {
    const current: any[] = [];
    const future: any[] = [];
    for (const task of this.items) {
      const item: MarkdownListModel = task.item;
      MarkdownHelper.buildRatingValue(item);

      current.push({axis: item.chartText, value: item.chartValue});
      future.push({axis: item.chartText, value: item.chartFutureValue});
    }

    return [current, future];
  }

  /* tslint:disable */
  render() {
    if (!this.items) {
      return;
    }
    this.data = this.taskToData();

  }
}
