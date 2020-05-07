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
    const introKey = 'home.hasIntro';
    this.storage.get(introKey).subscribe((value: boolean) => {
      if (!value) {
        setTimeout(() => {
          this.startIntro();
          this.storage.set(introKey, true).subscribe(() => {});
        }, 1000);
      }
    });
  }

  private startIntro() {
    this.introJS.setOptions({
      steps: [
        {
          element: '#step1',
          intro:
            '在『案例学习』里，你可以找到丰富的 DevOps 学习案例；你可以在 GitHub 上提交你的案例，加到入到示例中来。',
          position: 'bottom',
        },
        {
          element: '#step2',
          intro:
            '在『模式与原则』中，我们将和你分享一些软件开发、DevOps 顶层的原则与模式，用于在更高的层级来指导设计。',
          position: 'bottom',
        },
        {
          element: '#step3',
          intro:
            '在『最佳实践』里，我们收集了一系列的最优、最好的实践，来帮助你在实施的过程中，快速理解问题背后的原理。',
          position: 'bottom',
        },
        {
          element: '#step4',
          intro:
            '在『实施手册』里，我们将手把手教你，如何高效地在组织层级里实施 DevOps。',
          position: 'bottom',
        },
        {
          element: '#step-period',
          intro:
            '在『元素周期表』里，你可以通过了解流程的工具，来辅助你设计出 DevOps 流程所需要的工具。',
          position: 'top',
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
