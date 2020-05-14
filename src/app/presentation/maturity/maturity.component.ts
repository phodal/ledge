import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatDrawerContent } from '@angular/material/sidenav';
import { ActivatedRoute } from '@angular/router';
import { DocRoute } from '@ledge-framework/view/lib/ledge-multiple-docs/doc-route.model';

export const lists: DocRoute[] = [
  { displayName: 'DevOps 成熟度模型', source: 'devops' },
  { displayName: 'OWASP 安全成熟度模型', source: 'owasp' },
  { displayName: 'AMM 敏捷成熟度模型', source: 'amm' },
  { displayName: '架构设计成熟度模型', source: 'arch' },
  { displayName: '微服务成熟度模型', source: 'msmm' },
  { displayName: '软件维护成熟度模型', source: 'smmm' },
];

@Component({
  selector: 'app-maturity',
  templateUrl: './maturity.component.html',
  styleUrls: ['./maturity.component.scss'],
})
export class MaturityComponent implements OnInit {
  @ViewChild('drawerContent', { static: false })
  drawerContent: MatDrawerContent;

  currentSource: string;
  src: string;
  content: string;

  items: DocRoute[] = lists;
  currentUrl = '/maturity';
  urlPrefix = `maturities`;

  constructor(private title: Title, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((p) => {
      const param = p.get('name');
      const currentItem = this.items.find((item) => item.source === param);
      this.title.setTitle(
        `DevOps ${currentItem.displayName} 检查清单 - Ledge DevOps 知识平台`
      );
      this.currentSource = param;
    });
  }
}
