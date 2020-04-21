import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { HighlightState } from '../support';
import { MatDialog } from '@angular/material/dialog';
import { AtomDialogComponent } from '../atom-dialog/atom-dialog.component';

// in milliseconds
const STAY_AT_LEAST = 250;

@Component({
  selector: 'app-atom',
  templateUrl: './atom.component.html',
  styleUrls: ['./atom.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtomComponent implements OnInit, OnDestroy {
  @Input()
  data: any;

  @Input()
  metalSelected: HighlightState;

  @Input()
  selectedCategory: string;

  @Output()
  hoverAtom: EventEmitter<number> = new EventEmitter<number>();

  backgroundStyles: any = {};

  mouseEnterSubject = new Subject<number>();
  mouseLeaveSubject = new Subject<number>();
  private unsubscribe$ = new Subject<void>();

  constructor(public dialog: MatDialog) {
    this.backgroundStyles = {
      blurry: false,
      'solid-selected': false,
      'liquid-selected': false,
      'gas-selected': false,
      'unknown-selected': false,
      grayout: false,
    };
  }

  ngOnInit() {
    this.mouseEnterSubject
      .pipe(debounceTime(STAY_AT_LEAST), takeUntil(this.unsubscribe$))
      .subscribe(
        (value: number) => this.hoverAtom.emit(value),
        (err) => console.error(err)
      );

    this.mouseLeaveSubject
      .pipe(debounceTime(STAY_AT_LEAST), takeUntil(this.unsubscribe$))
      .subscribe(
        () => this.hoverAtom.emit(null),
        (err) => console.error(err)
      );
  }

  ngOnDestroy() {
    if (this.unsubscribe$) {
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
  }

  debounceMouseEnter() {
    this.mouseEnterSubject.next(this.data.number);
  }

  debounceMouseLeave() {
    this.mouseLeaveSubject.next(this.data.number);
  }

  clickAtom() {
    const dialogRef = this.dialog.open(AtomDialogComponent, {
      width: '480px',
      data: this.data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      // console.log('The dialog was closed');
    });
  }
}
