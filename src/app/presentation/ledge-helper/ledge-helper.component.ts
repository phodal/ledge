import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ledge-helper',
  templateUrl: './ledge-helper.component.html',
  styleUrls: ['./ledge-helper.component.scss']
})
export class LedgeHelperComponent implements OnInit {
  content = `
# Syntax Test

\`\`\`process-step
 - 平台层
   - 运维平台
   - 小米私有云
   - 小米生态云
 - 能力层
   - 团队注册
   - 一键接入
   - 检测扫描工具集成
   - 发布部署
   - 标准化工具接入
 - 工具层
   - Gitlab
   - Phabricator
   - Jenkins on K8s
   - 代码质量扫描
   - 安全/法律合规扫描
   - 二进制&产出物存储
   - 二进制安全扫描
   - 二进制法务审计扫描
   - 部署服务
 - 数据层
   - 数据智能应用
   - 研发效能数据仓库
\`\`\`

\`\`\`javascript
console.log('hello, world');
\`\`\`

| | normal | table |
|-|-|-|
| | | |
| | | |


\`\`\`process-table
| 源码管理 | 代码质量 | 制品管理  | 测试 | 持续集成 | 分析 | 协作  |
|-|-|-|-|-|-|-|
| Git | TSLint | Git (history) | Jasmine | GitHub Action | GitHub Traffic | GitHub Projects |
| GitHub | Code Climate | |  Jest | | Google Analysis |  |
\`\`\`
`;

  constructor() { }

  ngOnInit(): void {
  }

  changeContent($event: any) {
    this.content = $event;
  }
}
