import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MatDrawerContent } from '@angular/material/sidenav';
import { solutions } from './solutions';
import { TranslateService } from '@ngx-translate/core';
import { DocRoute } from '@ledge-framework/view/lib/ledge-multiple-docs/doc-route.model';

@Component({
  selector: 'app-solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss'],
})
export class SolutionComponent implements OnInit {
  @ViewChild('drawerContent', { static: false })
  drawerContent: MatDrawerContent;
  content: string;

  currentSource: string;
  src: string;
  currentUrl = '/solution';
  urlPrefix = `solutions`;
  items: DocRoute[] = solutions;

  constructor(
    private title: Title,
    private activatedRoute: ActivatedRoute,
    translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((p) => {
      const param = p.get('solution');
      const currentCase = this.items.find((ca) => ca.source === param);
      this.title.setTitle(
        `${currentCase.displayName} DevOps 厂商解决方案 - Ledge DevOps 知识平台`
      );
      this.currentSource = param;
    });
  }
}
