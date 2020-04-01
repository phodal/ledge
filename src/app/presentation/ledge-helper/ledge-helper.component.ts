import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ledge-helper',
  templateUrl: './ledge-helper.component.html',
  styleUrls: ['./ledge-helper.component.scss']
})
export class LedgeHelperComponent implements OnInit {
  content = `
# Syntax Test

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
