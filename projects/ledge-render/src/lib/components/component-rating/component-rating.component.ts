import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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

  changeForm($event: any, item: any) {
    console.log($event, item);
  }
}
