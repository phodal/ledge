import {Component, Input, OnInit} from '@angular/core';
import marked from 'marked';

interface ProcessTable {
  headers: string[];
  cells: string[][];
}

@Component({
  selector: 'component-process-table',
  templateUrl: './process-table.component.html',
  styleUrls: ['./process-table.component.scss']
})
export class ProcessTableComponent implements OnInit {
  @Input()
  tableValue: string;
  private textValue: string;
  processTable: ProcessTable = {
    headers: [],
    cells: []
  };
  headerSize = 0;

  constructor() {
  }

  ngOnInit(): void {
    this.textValue = `
| 项目 / 过程管理 | 配置管理 | 构建  | 测试 / 质量 | 制品 / 部署 | 基础设施 | 沟通协作 | 可视化   |
|---------------|---------|-------|------------|------------|---------|---------|---------|
| Jira          | Gitee   | Maven | Junit      | Ubran code | VMWare  | 招呼     | Tableau |
| Tracker       | Rational ClearCase |  Gradle | Cucumber | Fit2Cloud | OpenShift | 移事通 | Grafana |
| VP            | CMDB | NPM | JMeter     | B9         | Cloud Foundry | | Kibana |
| Confluence    |   Firefly    | Ant   | RobotFramework | JFrog Artifactory | | |  Prometheus |
| ITIL          |    | MSBuild | Protractor | | | | ElasticSearch |
|               |           |  Docker  | Sonar | | | | X-Pack |
|               |           |        | BlackDuck | | | | |

    `;

    const tokens = marked.lexer(this.textValue);
    this.buildData(tokens);
  }

  buildData(tokens: marked.Token[]) {
    for (const token of tokens) {
      if (token.type === 'table') {
        this.processTable.headers = token.header;
        this.processTable.cells = token.cells;

        this.headerSize = this.processTable.headers.length;
      }
    }
  }

  getHeaderColumn() {
    return {
      width: `calc(100% / ${this.headerSize} - 10px)`
    };
  }

  getColumnStyle() {
    return {
      width: `calc(100% / ${this.headerSize})`
    };
  }

  getHeaderClass(index: number) {
    if (index === 0) {
      return `first type_${index}`;
    } else {
      return `type_${index}`;
    }
  }
}
