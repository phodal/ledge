import { HttpClient } from '@angular/common/http';
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
import { assign, get } from 'lodash-es';
import { combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, map, startWith, takeUntil, tap } from 'rxjs/operators';
import { Atom, HighlightState } from '../shared';

const MAX_ROW_INDEX = 7;
const MAX_COL_INDEX = 18;
const DESCRIPTION = {
  number: 'Atomic',
  symbol: 'SYM',
  name: 'Name',
  atomic_mass: 'Weight',
};

// in milliseconds
const STAY_AT_LEAST = 25;

interface HeaderInfo {
  rowNum: number;
  colNum: number;
  inside: boolean;
}

@Component({
  selector: 'app-periodic-table',
  templateUrl: './periodic-table.component.html',
  styleUrls: ['./periodic-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodicTableComponent implements OnInit, OnChanges {
  @Input()
  selectedMetal: any;

  @Output()
  currentAtomCategory: EventEmitter<string> = new EventEmitter<string>();

  description = DESCRIPTION;

  colHeader: { index: number; description: string; selected: boolean }[];
  rowHeader: { index: number; className: string; selected: boolean }[];
  unsubscribe$ = new Subject<void>();
  headerSub$ = new Subject<HeaderInfo>();
  headerMove$: Observable<HeaderInfo>;
  atoms$: Observable<Atom[]>;

  atoms: Atom[];
  metalClass: HighlightState;
  currentAtom: Atom;
  currentRowHeader: number;
  currentColHeader: number;
  selectCategory: string;

  wikiAtomName = '';

  constructor(private http: HttpClient) {
    this.colHeader = Array(MAX_COL_INDEX)
      .fill(1)
      .map((v, i) => ({
        index: i + 1,
        description: i === 14 ? 'Pnictogens' : i === 15 ? 'Chalcogens' : i === 16 ? 'Halogens' : '',
        selected: false,
      }));

    this.rowHeader = [
      {index: 1, className: 'one', selected: false},
      {index: 2, className: 'two', selected: false},
      {index: 3, className: 'three', selected: false},
      {index: 4, className: 'four', selected: false},
      {index: 5, className: 'fifth', selected: false},
      {index: 6, className: 'six', selected: false},
      {index: 7, className: 'seven', selected: false},
    ];

    this.currentAtom = null;
    this.currentRowHeader = null;
    this.currentColHeader = null;
    this.atoms = null;
    this.selectCategory = '';
  }

  ngOnInit() {
    this.headerMove$ = this.headerSub$.pipe(
      startWith({
        rowNum: -1,
        colNum: -1,
        inside: false,
      }),
      debounceTime(STAY_AT_LEAST)
    );

    this.atoms$ = combineLatest(
      this.http.get<Atom[]>('./assets/periodic-table.json').pipe(startWith([] as Atom[])),
      this.headerMove$
    ).pipe(
      map(([atoms, headerMove]) => {
        return atoms;
      }),
      tap(atoms => (this.atoms = atoms)),
      takeUntil(this.unsubscribe$)
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    const {selectedMetal = null} = changes;
    this.metalClass = get(selectedMetal, 'currentValue', null);
  }

  showAtomDetails(atomNumber: number) {
    console.log('hover detail');
  }

  enterPhase(type: string) {
    this.selectCategory = type;
  }

  open(atomName) {
    // this.wikiAtomName = atomName;
  }
}
