import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-atom-category',
  template: `<div
    (mouseenter)="enter.emit(type)"
    (mouseleave)="enter.emit('')"
    [class.selected]="selected"
  >
    <div class="{{ type }} item-block"></div>
    <span class="symbol">{{ symbol }}</span>
  </div> `,
  styleUrls: ['./atom-category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtomCategoryComponent implements OnInit {
  @Output()
  enter = new EventEmitter<string>();

  @Input()
  selected: boolean;

  @Input()
  symbol: string;

  @Input()
  type: string;

  constructor() {}

  ngOnInit() {}
}
