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
import { RatingModel } from '../model/rating.model';

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
  @Input() item: RatingModel;
  @Input() isParent: boolean;
  @Output() itemChange = new EventEmitter();

  disabled = false;

  onChange(_) {}

  onTouched(_) {}

  ngOnInit() {

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
