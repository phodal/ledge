import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-maturity',
  templateUrl: './maturity.component.html',
  styleUrls: ['./maturity.component.scss'],
})
export class MaturityComponent implements OnInit {
  list = [
    {
      name: '第二部分：敏捷开发管理',
      key: 'agile',
      value: `
 - [ ] 需求管理
 - [ ] 过程管理
 - [ ] 组织模型
`,
    },
    {
      name: '第三部分：持续交付',
      key: 'cd',
      value: `
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
  `,
    },
    {
      name: '第四部分：技术运营',
      key: 'techops',
      value: `
 - [ ] 监控管理
 - [ ] 事件管理
 - [ ] 变更管理
 - [ ] 容量和性能管理
 - [ ] 成本管理
 - [ ] 连续性管理
 - [ ] 用户体验管理
 - [ ] 运营一体化平台
      `,
    },
  ];

  constructor(title: Title) {
    title.setTitle('Ledge DevOps 知识平台 - 成熟度');
  }

  ngOnInit(): void {}
}
