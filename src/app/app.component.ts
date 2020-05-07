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

  constructor(
    private route: Router,
    public translate: TranslateService,
    private storage: StorageMap
  ) {
    translate.use('zh-cn');
  }

  // todo: refactor
  isHome() {
    return (
      this.route.url === '/home' ||
      this.route.url === '/maturity' ||
      this.route.url === '/report' ||
      this.route.url === '/design'
    );
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    this.storage.set('language', lang).subscribe(() => {});
  }

  ngOnInit(): void {
    this.storage.get('language').subscribe((value: string) => {
      if (!!value) {
        this.translate.use(value);
      }
    });
  }

  openLink(link: string) {
    window.open(link, '_blank');
  }
}
