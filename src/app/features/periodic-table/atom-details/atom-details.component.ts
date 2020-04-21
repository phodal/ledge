import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'app-atom-details',
  templateUrl: './atom-details.component.html',
  styleUrls: ['./atom-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtomDetailsComponent implements OnInit {
  @Input()
  data = null;

  ngOnInit() {}
}
