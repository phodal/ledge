import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatDrawerContent } from '@angular/material/sidenav';
import { ActivatedRoute } from '@angular/router';
import { Cases } from '../case-study/cases';
import { DocRoute } from '@ledge-framework/view/lib/ledge-multiple-docs/doc-route.model';

export const reports: Cases = [
  { displayName: '2019', source: '2019', default: true },
  { displayName: '2020', source: '2020' },
];

@Component({
  selector: 'app-reporter',
  templateUrl: './reporter.component.html',
  styleUrls: ['./reporter.component.scss'],
})
export class ReporterComponent implements OnInit {
  @ViewChild('drawerContent', { static: false })
  drawerContent: MatDrawerContent;

  currentSource: string;
  src: string;
  content: string;

  items: DocRoute[] = reports;
  currentUrl = '/report';
  urlPrefix = `reports`;

  constructor(private title: Title, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((p) => {
      const param = p.get('year');
      const currentItem = this.items.find((item) => item.source === param);
      this.title.setTitle(
        `DevOps ${currentItem.displayName} 年度报告 - Ledge DevOps 知识平台`
      );
      this.currentSource = param;
    });
  }
}
