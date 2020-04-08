import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-atom-details',
  templateUrl: './atom-details.component.html',
  styleUrls: ['./atom-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtomDetailsComponent implements OnInit, OnChanges {
  @Input()
  data = null;

  phaseClass = {};

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    const { data = null } = changes;
    this.phaseClass = {
      gas: data?.currentValue?.phase === 'gas',
      solid: data?.currentValue?.phase === 'solid',
      unknown: data?.currentValue?.phase === 'unknown',
      liquid: data?.currentValue?.phase === 'liquid',
    };
  }
}
