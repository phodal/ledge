import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { MatSidenav } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  title = 'ledge';

  @ViewChild('sidenav') SideNavRef: MatSidenav;
  routeEvSub: Subscription;

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

  ngAfterViewInit(): void {
    this.routeEvSub = this.route.events.subscribe(() => {
      if (this.SideNavRef.opened) {
        this.SideNavRef.close();
      }
    });
  }

  openLink(link: string) {
    window.open(link, '_blank');
  }

  ngOnDestroy(): void {
    this.routeEvSub.unsubscribe();
  }
}
