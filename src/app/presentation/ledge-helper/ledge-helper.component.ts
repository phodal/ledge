import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SplitAreaDirective, SplitComponent } from 'angular-split';
import * as mdData from 'raw-loader!../../../assets/docs/help.md';
import { EMPTY, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
@Component({
  selector: 'app-ledge-helper',
  templateUrl: './ledge-helper.component.html',
  styleUrls: ['./ledge-helper.component.scss'],
})
export class LedgeHelperComponent implements OnInit, OnDestroy {
  content = mdData.default;

  @ViewChild('split', { static: false }) split: SplitComponent;
  @ViewChild('area1', { static: false }) area1: SplitAreaDirective;
  @ViewChild('area2', { static: false }) area2: SplitAreaDirective;

  direction = 'horizontal';
  sizes = {
    percent: {
      area1: 30,
      area2: 70,
    },
    pixel: {
      area1: 120,
      area2: '*',
      area3: 160,
    },
  };
  aceOptions = {
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
  };
  acEditor: any;
  themes = [
    'chrome',
    'clouds',
    'chaos',
    'eclipse',
    'github',
    'iplastic',
    'monokai',
    'merbivore',
    'terminal',
    'textmate',
    'tomorrow',
    'twilight',
    'xcode',
  ];
  themeSelected = 'chrome';
  term$ = new Subject<string>();
  private searchSubscription: Subscription;

  constructor(public translate: TranslateService) {
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

  dragEnd(unit, { sizes }) {
    if (unit === 'percent') {
      this.sizes.percent.area1 = sizes[0];
      this.sizes.percent.area2 = sizes[1];
    } else if (unit === 'pixel') {
      this.sizes.pixel.area1 = sizes[0];
      this.sizes.pixel.area2 = sizes[1];
      this.sizes.pixel.area3 = sizes[2];
    }
  }

  onAceChange(data) {
    console.log('~~~编辑器内容变化~~~', data);
  }

  editorRef($event) {
    this.acEditor = $event;
  }
}
