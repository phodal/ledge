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
 -  [ ] 配置管理: 3
   - [ ] 版本控制
   - [ ] 变更管理
 -  [ ] 持续与持续集成: 3
   - [ ] 构建实践
   - [ ] 持续集成
 -  [ ] 测试管理: 3
   - [ ] 测试分层策略
   - [ ] 代码质量管理
   - [ ] 自动化测试
 -  [ ] 部署与发布管理: 3
   - [ ] 部署与发布管理
   - [ ] 部署流水线
 -  [ ] 环境管理: 3
 -  [ ] 数据管理: 3
   - [ ] 测试数据管理
   - [ ] 数据变更管理
 -  [ ] 度量与反馈: 3
   - [ ] 度量指标
   - [ ] 度量驱动改进

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
