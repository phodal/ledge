import { Component, OnDestroy, OnInit } from '@angular/core';
import { EMPTY, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import * as mdData from 'raw-loader!../../../assets/docs/help.md';

@Component({
  selector: 'app-ledge-helper',
  templateUrl: './ledge-helper.component.html',
  styleUrls: ['./ledge-helper.component.scss'],
})
export class LedgeHelperComponent implements OnInit, OnDestroy {
  content = mdData.default;

  term$ = new Subject<string>();
  private searchSubscription: Subscription;

  constructor() {
    this.searchSubscription = this.term$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((term) => {
          this.content = term;
          return EMPTY;
        })
      )
      .subscribe();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
      this.searchSubscription = null;
    }
  }
}
