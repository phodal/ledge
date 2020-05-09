import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MatDrawerContent } from '@angular/material/sidenav';
import { DocRoute } from '../../shared/components/ledge-multiple-docs/doc-route.model';
import { TranslateService } from '@ngx-translate/core';
import { thinktanks } from './thinktanks';

@Component({
  selector: 'app-think-tank',
  templateUrl: './think-tank.component.html',
  styleUrls: ['./think-tank.component.scss'],
})
export class ThinkTankComponent implements OnInit {
  @ViewChild('drawerContent', { static: false })
  drawerContent: MatDrawerContent;
  content: string;

  currentSource: string;
  src: string;
  currentUrl = '/think-tank';
  urlPrefix = `think-tank`;
  items: DocRoute[] = thinktanks;

  constructor(
    private title: Title,
    private activatedRoute: ActivatedRoute,
    translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((p) => {
      const param = p.get('tank');
      const currentCase = this.items.find((ca) => ca.source === param);
      this.title.setTitle(
        `${currentCase.displayName}智库 - Ledge DevOps 知识平台`
      );
      this.currentSource = param;
    });
  }
}
