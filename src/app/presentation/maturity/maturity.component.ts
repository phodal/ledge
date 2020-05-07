import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatTabChangeEvent } from '@angular/material/tabs/tab-group';
import * as owasp from 'raw-loader!../../../assets/docs/maturities/owasp.md';
import * as amm from 'raw-loader!../../../assets/docs/maturities/amm.md';
import * as arch from 'raw-loader!../../../assets/docs/maturities/arch.md';

@Component({
  selector: 'app-maturity',
  templateUrl: './maturity.component.html',
  styleUrls: ['./maturity.component.scss'],
})
export class MaturityComponent {
  selectedTabIndex = 0;

  list = [
    {
      name: '第一部分：敏捷开发管理',
      key: 'agile',
      value: `
 - [ ] 需求管理: 2
 - [ ] 过程管理: 2
 - [ ] 组织模型: 2
`,
    },
    {
      name: '第二部分：持续交付',
      key: 'cd',
      value: `
 -  [ ] 配置管理: 3
   - [ ] 版本控制
   - [ ] 变更管理
 -  [ ] 持续构建与持续集成: 3
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
      name: '第三部分：技术运营',
      key: 'techops',
      value: `
 - [ ] 监控管理: 2
 - [ ] 事件管理: 2
 - [ ] 变更管理: 2
 - [ ] 容量和性能管理: 2
 - [ ] 成本管理: 2
 - [ ] 连续性管理: 2
 - [ ] 用户体验管理: 2
 - [ ] 运营一体化平台: 2
      `,
    },
  ];

  item: any = { content: '' };
  contentMap = [
    { name: 'DevOps 成熟度模型', key: '' },
    {
      name: 'OWASP 安全成熟度模型',
      key: 'owasp',
      content: owasp.default,
    },
    {
      name: 'AMM 敏捷成熟度模型',
      key: 'amm',
      content: amm.default,
    },
    {
      name: '架构成熟度模型',
      key: 'arch',
      content: arch.default,
    },
  ];

  maturity = {
    table: '',
  };

  constructor(title: Title) {
    title.setTitle('DevOps 成熟度评估 — Ledge DevOps 知识平台 ');
  }

  onTabChanged($event: MatTabChangeEvent) {
    this.selectedTabIndex = $event.index;
    this.item = this.contentMap[this.selectedTabIndex];
  }
}
