import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatDrawerContent } from '@angular/material/sidenav';
import { DocRoute } from '@ledge-framework/view/lib/ledge-multiple-docs/doc-route.model';

export const lists: DocRoute[] = [
  { displayName: '新项目检查清单', source: 'new-project' },
  { displayName: '敏捷实践检查清单', source: 'agile-practise' },
  { displayName: 'DevOps 检查清单（Azure）', source: 'azure-devops' },
  { displayName: 'DevOps 检查清单（AWS）', source: 'aws-devops' },
  { displayName: 'DevSecOps 检查清单', source: 'devsecops' },
  { displayName: '极限编程检查清单', source: 'xp-practise' },
  { displayName: '代码回顾检查清单', source: 'code-review' },
  { displayName: 'API 安全性检查清单', source: 'api-security' },
  { displayName: '前端项目检查清单', source: 'frontend' },
  { displayName: 'Node.js项目检查清单', source: 'nodejs-practices' },
  { displayName: '微服务生产就绪检查清单', source: 'microservices' },
  { displayName: '自组织团队建设检查清单', source: 'self-org' },
  { displayName: '需求阿尔法检查清单', source: 'semat-requirements' },
];

@Component({
  selector: 'app-checklists',
  templateUrl: './checklists.component.html',
  styleUrls: ['./checklists.component.scss'],
})
export class ChecklistsComponent implements OnInit {
  @ViewChild('drawerContent', { static: false })
  drawerContent: MatDrawerContent;

  currentSource: string;
  src: string;
  content: string;

  items: DocRoute[] = lists;
  currentUrl = '/checklists';
  urlPrefix = `checklists`;

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
