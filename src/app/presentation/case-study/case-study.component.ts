import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDrawerContent } from '@angular/material/sidenav';
import { TranslateService } from '@ngx-translate/core';

import { Case, cases } from './cases';

@Component({
  selector: 'app-case-study',
  templateUrl: './case-study.component.html',
  styleUrls: ['./case-study.component.scss'],
})
export class CaseStudyComponent implements OnInit {
  @ViewChild('drawerContent', { static: false })
  drawerContent: MatDrawerContent;
  currentSource: string;
  src: string;
  content: string;
  items: Case[] = cases;
  currentUrl = '/case-study';

  constructor(
    private title: Title,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((p) => {
      const param = p.get('case');
      const currentCase = this.items.find((ca) => ca.source === param);
      this.title.setTitle(
        `${currentCase.displayName} DevOps 案例学习（互联网公司/传统公司） - Ledge DevOps 知识平台`
      );
      this.configSource(param);
    });
  }

  private configSource(value: string) {
    this.getCase(value);
  }

  async getCase(source: string) {
    this.src = this.buildSrc(source);
    this.currentSource = source;

    const headers = new HttpHeaders().set(
      'Content-Type',
      'text/plain; charset=utf-8'
    );
    this.http
      .get(this.src, { headers, responseType: 'text' })
      .subscribe((response) => {
        this.resetScrollbar();
        this.content = response;
      });
  }

  private resetScrollbar() {
    if (!!this.drawerContent) {
      if (!this.drawerContent.hasOwnProperty('nativeElement')) {
        this.drawerContent.getElementRef().nativeElement.scrollTop = 0;
      }
    }
  }

  private buildSrc(source: string) {
    return `assets/docs/casestudies/${source}.md`;
  }
}
