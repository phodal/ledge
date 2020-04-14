import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ledge';
  tran: TranslateService;

  constructor(private route: Router, translate: TranslateService) {
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
  }
}
