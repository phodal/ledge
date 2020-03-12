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


const LANT_ATOM_GROUP = {
  number: '57-71',
  category: 'lanthanide',
  symbol: '',
  name: '',
  atomic_mass: null,
};
const ACT_ATOM_GROUP = {
  number: '89-103',
  category: 'actinide',
  symbol: '',
  name: '',
  atomic_mass: null,
};

@Component({
  selector: 'app-periodic-table',
  templateUrl: './periodic-table.comp' +
    'onent.html',
  styleUrls: ['./periodic-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeriodicTableComponent implements OnInit, OnChanges {
  @Input()
  selectedMetal: any;

  @Output()
  currentAtomCategory: EventEmitter<string> = new EventEmitter<string>();

  description = DESCRIPTION;
  lantAtomGroup = LANT_ATOM_GROUP;
  actinideAtomGroup = ACT_ATOM_GROUP;
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

  categories = [
    { type: 'scm', displayName: '源码管理'},
    { type: 'packageManage', displayName: '工件管理'},
    { type: 'database', displayName: '数据库自动化'},
    { type: 'testing', displayName: '测试'},
    { type: 'deployment', displayName: '部署'},
    { type: 'ci', displayName: '持续集成'},
    { type: 'containers', displayName: '容器化'},
    { type: 'releaseOrchestration', displayName: '发布编排'},
    { type: 'security', displayName: '安全'},
    { type: 'openCloud', displayName: '开源云'},
    { type: 'publicCloud', displayName: '公有云'},
    { type: 'monitoring', displayName: '监控'},
    { type: 'analytics', displayName: '分析'},
    { type: 'config', displayName: '配置管理'},
    { type: 'aiops', displayName: '智能运维'},
    { type: 'collaboration', displayName: '协作'},
    { type: 'operation', displayName: '运营'},
  ];

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
    if (atomNumber) {
      this.currentAtom = this.atoms.find(a => a.number === atomNumber);
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
