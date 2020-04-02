import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-maturity',
  templateUrl: './maturity.component.html',
  styleUrls: ['./maturity.component.scss'],
})
export class MaturityComponent implements OnInit {
  list = [
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
  ];
  constructor() {}

  ngOnInit(): void {}
}
