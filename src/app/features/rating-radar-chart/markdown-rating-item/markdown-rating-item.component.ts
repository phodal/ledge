import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MarkdownListModel } from '../../../shared/model/markdown.model';
import MarkdownHelper from '../../../shared/model/markdown.helper';
import { MatSliderChange } from '@angular/material/slider';

@Component({
  selector: 'markdown-rating-item',
  templateUrl: './markdown-rating-item.component.html',
  styleUrls: ['./markdown-rating-item.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MarkdownRatingItemComponent),
      multi: true,
    },
  ],
})
export class MarkdownRatingItemComponent implements OnInit {
  @Input() item: MarkdownListModel;
  @Input() isParent: boolean;
  @Output() itemChange = new EventEmitter();

  disabled = false;

  onChange(_) {}

  onTouched(_) {}

  ngOnInit() {}

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
    const item = MarkdownHelper.updateTextFromRatingValue(this.item);
    this.itemChange.emit(item);
  }
}
