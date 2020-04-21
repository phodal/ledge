import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-atom-category',
  template: `
    <div
      (mouseenter)="enter.emit(type)"
      (mouseleave)="enter.emit('')"
      [class.selected]="selected"
    >
      <div class="{{ type }} item-block"></div>
      <span class="symbol">{{ name }}</span>
    </div>
  `,
  styleUrls: ['./atom-category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtomCategoryComponent implements OnInit, OnChanges {
  @Output()
  enter = new EventEmitter<string>();

  @Input()
  selected: boolean;

  @Input()
  name: string;

  @Input()
  type: string;

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.name) {
      this.name = changes.name.currentValue;
    }
  }
}
