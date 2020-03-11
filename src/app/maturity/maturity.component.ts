import { Component, OnInit } from '@angular/core';
import marked from 'marked';
import MarkdownHelper from '../shared/components/model/markdown.helper';
import {MarkdownTaskItemService} from '../shared/components/markdown-radar-chart/markdown-task-item.service';

@Component({
  selector: 'app-maturity',
  templateUrl: './maturity.component.html',
  styleUrls: ['./maturity.component.scss']
})
export class MaturityComponent implements OnInit {
  private textValue = `
 -  [ ] 配置管理:3
 -  [ ] 持续与持续集成:3
 -  [ ] 测试管理:3
 -  [ ] 部署与发布管理:4
 -  [ ] 环境管理:4
 -  [ ] 数据管理:4
 -  [ ] 数据变更管理:3
 -  [ ] 度量与反馈:3

  `;
  private tasks: any;

  constructor(private markdownTaskItemService: MarkdownTaskItemService) {

  }

  ngOnInit(): void {
    const tokens = marked.lexer(this.textValue);
    this.tasks = MarkdownHelper.markdownToJSON(tokens, this.tasks);
    this.markdownTaskItemService.setTasks(this.tasks);
  }

  updateModel($event: any) {

  }
}
