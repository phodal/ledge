import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-phase',
  template: `
      <div class="{{ type }}"
           (mouseenter)="enter.emit(type)"
           (mouseleave)="enter.emit('')"
           [class.selected]="selected">
          {{ symbol }}
      </div>
  `,
  styleUrls: ['./app-phase.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppPhaseComponent implements OnInit {
  @Output()
  enter = new EventEmitter<string>();

  @Input()
  selected: boolean;

  @Input()
  symbol: string;

  @Input()
  type: string;

  constructor() {
  }

  ngOnInit() {
  }
}
