import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import * as introJs from 'intro.js/intro.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'ledge';
  introJS = introJs();

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
    this.storage.set('language', lang).subscribe();
  }

  ngOnInit(): void {
    this.storage.get('language').subscribe((value: string) => {
      if (!!value) {
        this.translate.use(value);
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.startIntro();
    }, 3000);
  }

  private startIntro() {
    this.introJS.setOptions({
      steps: [
        {
          element: '#step1',
          intro: 'Welcome to your new app!',
          position: 'bottom',
        },
        {
          element: '#step2',
          intro: "Ok, wasn't that fun?",
          position: 'right',
        },
        {
          element: '#step3',
          intro: "let's keep going",
          position: 'top',
        },
        {
          element: '#step-period',
          intro: 'More features, more fun.',
          position: 'right',
        },
      ],
      showProgress: true,
    });
    this.introJS.start();
  }

  openLink(link: string) {
    window.open(link, '_blank');
  }
}
