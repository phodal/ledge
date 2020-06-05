import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { MatDrawerContent } from '@angular/material/sidenav';
import { ActivatedRoute } from '@angular/router';
import { Cases } from '../case-study/cases';
import { DocRoute } from '@ledge-framework/view/lib/ledge-multiple-docs/doc-route.model';

export const trees: Cases = [
  { displayName: 'DevOps 技能图谱', source: 'devops-skilltree' },
  { displayName: '架构技能图谱', source: 'arch-skilltree' },
  { displayName: '前端技能图谱', source: 'frontend-skilltree' },
  { displayName: '后端技能图谱', source: 'backend-skilltree' },
];

@Component({
  selector: 'app-skill-tree',
  templateUrl: './skill-tree.component.html',
  styleUrls: ['./skill-tree.component.scss'],
})
export class SkillTreeComponent implements OnInit {
  @ViewChild('drawerContent', { static: false })
  drawerContent: MatDrawerContent;

  currentSource: string;
  src: string;
  content: string;

  items: DocRoute[] = trees;
  currentUrl = '/skilltree';
  urlPrefix = `skilltrees`;

  constructor(private title: Title, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((p) => {
      const param = p.get('skilltree');
      const currentItem = this.items.find((item) => item.source === param);
      this.title.setTitle(
        `DevOps ${currentItem.displayName} 技能图谱 - Ledge DevOps 知识平台`
      );
      this.currentSource = param;
    });
  }
}
