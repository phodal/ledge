import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RatingItemModel } from '../model/rating.model';

@Component({
  selector: 'component-rating',
  templateUrl: './component-rating.component.html',
  styleUrls: ['./component-rating.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComponentRatingComponent),
      multi: true,
    },
  ],
})
export class ComponentRatingComponent implements OnInit, ControlValueAccessor {
  @Input() data: any[];
  @Output() dataChange = new EventEmitter<any>();

  @Input() isParent = false;
  @Input() instanceKey: string;

  disabled = false;

  onChange(_) {}

  onTouched(_) {}

  constructor() {}

  ngOnInit(): void {
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
    if (obj !== null) {
      this.data = obj;
    }
  }

  changeForm($event: any, item: RatingItemModel, index: number) {
    item.name = item.displayName + ': ' + item.chartValue;
    this.data[index] = item;
    this.dataChange.emit(this.data);
  }
}
