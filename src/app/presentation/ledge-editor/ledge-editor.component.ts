import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SplitAreaDirective, SplitComponent } from 'angular-split';

import * as mdData from 'raw-loader!../../../assets/docs/help.md';

import 'brace/index';
import 'brace/mode/markdown';
import 'brace/theme/github';
import 'brace/theme/monokai';
import { StorageMap } from '@ngx-pwa/local-storage';

const storyKey = 'editor.content';

@Component({
  selector: 'ledge-editor',
  templateUrl: './ledge-editor.component.html',
  styleUrls: ['./ledge-editor.component.scss'],
})
export class LedgeEditorComponent implements OnInit, OnDestroy {
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
    'github',
    'monokai',
    /*  'chrome',
    'clouds',
    'chaos',
    'eclipse',
    'iplastic',
    'tomorrow',
    'merbivore',
    'terminal',
    'textmate',
    'twilight',
    'xcode', */
  ];
  themeSelected = 'github';
  term$ = new Subject<string>();
  private searchSubscription: Subscription;

  constructor(public translate: TranslateService, private storage: StorageMap) {
    this.searchSubscription = this.term$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((term) => {
          this.content = term;
          this.storage.set(storyKey, term).subscribe();
          return EMPTY;
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.storage.get(storyKey).subscribe((value: string) => {
      if (value) {
        this.content = value;
      }
    });
  }

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

  onAceChange($event) {
    this.term$.next($event);
  }

  editorRef($event) {
    this.acEditor = $event;
  }
}
