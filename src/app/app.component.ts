import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StorageMap } from '@ngx-pwa/local-storage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'ledge';
  tran: TranslateService;

  constructor(
    private route: Router,
    translate: TranslateService,
    private storage: StorageMap
  ) {
    translate.setDefaultLang('zh-cn');
    translate.use('zh-cn');

    this.tran = translate;
  }

  // component-todo: refactor
  isHome() {
    return (
      this.route.url === '/home' ||
      this.route.url === '/maturity' ||
      this.route.url === '/report' ||
      this.route.url === '/design'
    );
  }

  setLanguage(lang: string) {
    this.tran.use(lang);
    this.storage.set('language', lang);
  }

  ngOnInit(): void {
    this.storage.get('language').subscribe((value: string) => {
      if (!!value) {
        this.tran.use(value);
      }
    });
  }
}
