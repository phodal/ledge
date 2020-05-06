import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MarkdownTaskItemService } from '../markdown-task-item.service';
import MarkdownHelper from '../../../shared/model/markdown.helper';

@Component({
  selector: 'markdown-rating',
  templateUrl: './markdown-rating.component.html',
  styleUrls: ['./markdown-rating.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MarkdownRatingComponent),
      multi: true,
    },
  ],
})
export class MarkdownRatingComponent implements OnInit, ControlValueAccessor {
  @Input() list: [];
  @Input() isParent = false;
  @Input() instanceKey: string;

  disabled = false;

  onChange(_) {}

  onTouched(_) {}

  constructor(private markdownTaskItemService: MarkdownTaskItemService) {}

  ngOnInit(): void {}

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
      this.list = obj;
    }
  }

  changeForm($event: any, item: any) {
    const execArray = /(.*)\:\s*(\d)/.exec(item.originText);
    if (execArray && execArray.length >= 3) {
      const text = execArray[1];
      item.originText = text + ': ' + item.value;
    } else {
      item.originText = item.originText + ': ' + item.value;
    }

    const list = this.markdownTaskItemService.updateTask(
      null,
      this.instanceKey,
      item
    );
    this.onChange(list);
  }
}
