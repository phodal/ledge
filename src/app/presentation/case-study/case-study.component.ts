import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MatDrawerContent } from '@angular/material/sidenav';
import { TranslateService } from '@ngx-translate/core';

import { cases } from './cases';
import { DocRoute } from '@ledge-framework/view/lib/ledge-multiple-docs/doc-route.model';

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

  items: DocRoute[] = cases;
  currentUrl = '/case-study';
  urlPrefix = `casestudies`;

  constructor(
    private title: Title,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((p) => {
      const param = p.get('case');
      const currentItem = this.items.find((item) => item.source === param);
      this.title.setTitle(
        `${currentItem.displayName} DevOps 案例学习（互联网公司/传统公司） - Ledge DevOps 知识平台`
      );
      this.currentSource = param;
    });
  }
}
