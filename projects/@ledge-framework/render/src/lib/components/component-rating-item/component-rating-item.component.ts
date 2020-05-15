import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSliderChange } from '@angular/material/slider';
import { RatingItemModel } from '../model/rating.model';

@Component({
  selector: 'component-rating-item',
  templateUrl: './component-rating-item.component.html',
  styleUrls: ['./component-rating-item.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComponentRatingItemComponent),
      multi: true,
    },
  ],
})
export class ComponentRatingItemComponent implements OnInit {
  @Input() item: RatingItemModel;
  @Output() itemChange = new EventEmitter();

  disabled = false;

  onChange(_) {}

  onTouched(_) {}

  ngOnInit() {
    const nameValuesSplit = this.item.name.split(': ');
    this.item.displayName = nameValuesSplit[0];
    if (nameValuesSplit.length > 1) {
      this.item.chartValue = parseInt(nameValuesSplit[1], 10);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.itemChange.emit = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    if (obj !== null && obj !== undefined) {
      this.item = obj;
    }
  }

  updateValue($event: MatSliderChange) {
    this.itemChange.emit(this.item);
  }
}
