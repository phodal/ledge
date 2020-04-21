import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, map, startWith, takeUntil, tap } from 'rxjs/operators';
import { Atom, HighlightState } from '../support';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

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
  category: 'atom-placeholder',
  symbol: '',
  name: '',
  atomic_mass: null,
};
const ACT_ATOM_GROUP = {
  number: '89-103',
  category: 'atom-placeholder',
  symbol: '',
  name: '',
  atomic_mass: null,
};

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

  categories = [];
  zhCategories = [
    { type: 'scm', displayName: '源码管理' },
    { type: 'packageManage', displayName: '制品管理' },
    { type: 'database', displayName: '数据库自动化' },
    { type: 'testing', displayName: '测试' },
    { type: 'config', displayName: '配置管理' },
    { type: 'ci', displayName: '持续集成' },
    { type: 'deployment', displayName: '部署' },
    { type: 'security', displayName: '安全' },
    { type: 'containers', displayName: '容器化' },
    { type: 'releaseOrchestration', displayName: '发布编排' },
    { type: 'openCloud', displayName: '开源云' },
    { type: 'publicCloud', displayName: '公有云' },
    { type: 'monitoring', displayName: '监控' },
    { type: 'analytics', displayName: '分析' },
    { type: 'aiops', displayName: '智能运维' },
    { type: 'collaboration', displayName: '协作' },
    { type: 'operation', displayName: '运营' },
    { type: 'platform', displayName: '平台' },
  ];

  enCategories = [
    { type: 'scm', displayName: 'SCM' },
    { type: 'packageManage', displayName: 'Package Mgr.' },
    { type: 'database', displayName: 'Database Mgr.' },
    { type: 'testing', displayName: 'Testing' },
    { type: 'config', displayName: 'Config Mgr.' },
    { type: 'ci', displayName: 'CI' },
    { type: 'deployment', displayName: 'Deployment' },
    { type: 'security', displayName: 'Security' },
    { type: 'containers', displayName: 'Containers' },
    { type: 'releaseOrchestration', displayName: 'Release Orc.' },
    { type: 'openCloud', displayName: 'OS Cloud' },
    { type: 'publicCloud', displayName: 'Public Cloud' },
    { type: 'monitoring', displayName: 'Monitoring' },
    { type: 'analytics', displayName: 'Analysis' },
    { type: 'aiops', displayName: 'AIOps' },
    { type: 'collaboration', displayName: 'Collaboration' },
    { type: 'operation', displayName: 'Ops' },
    { type: 'platform', displayName: 'Platform' },
  ];

  constructor(
    private http: HttpClient,
    public translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {
    this.currentAtom = null;
    this.currentRowHeader = null;
    this.currentColHeader = null;
    this.atoms = null;
    this.selectCategory = '';
    this.updateCategoriesByLang();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.updateCategoriesByLang();
      this.cd.detectChanges();
    });
  }

  private updateCategoriesByLang() {
    if (this.translate.currentLang === 'en') {
      this.categories = this.enCategories;
    } else {
      this.categories = this.zhCategories;
    }
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

    const tableReq = this.http
      .get<Atom[]>('./assets/periodic-table.json')
      .pipe(startWith([] as Atom[]));

    this.atoms$ = combineLatest([tableReq, this.headerMove$]).pipe(
      map(([atoms, headerMove]) => {
        return atoms;
      }),
      tap((atoms) => (this.atoms = atoms)),
      takeUntil(this.unsubscribe$)
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    const { selectedMetal = null } = changes;
    this.metalClass = selectedMetal?.currentValue || null;
  }

  showAtomDetails(atomNumber: number) {
    if (atomNumber) {
      this.currentAtom = this.atoms.find((a) => a.number === atomNumber);
      this.currentAtomCategory.emit(this.currentAtom?.category || null);
    }
  }

  select(type: string) {
    this.selectCategory = type;
  }
}
