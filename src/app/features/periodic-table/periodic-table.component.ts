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
    if (atomNumber) {
      this.currentAtom = this.atoms.find(a => a.number === atomNumber);
      const { xpos, ypos } = this.currentAtom;
      // if (ypos > MAX_ROW_INDEX) {
      //   this.rowHeader[ypos - 2 - 1].selected = true;
      // } else {
      //   this.rowHeader[ypos - 1].selected = true;
      //   this.colHeader[xpos - 1].selected = true;
      // }
      this.currentAtomCategory.emit(get(this.currentAtom, 'category', null));
    }
  }

  enterPhase(type: string) {
    this.selectCategory = type;
  }

  open(atomName) {
    // this.wikiAtomName = atomName;
  }
}
