import { Component, Input, OnInit } from '@angular/core';
import marked from 'marked';
import { zip } from 'lodash-es';

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
  processTable: ProcessTable = {
    headers: [],
    cells: []
  };
  headerSize = 0;

  constructor() {
  }

  ngOnInit(): void {
    const tokens = marked.lexer(this.tableValue);
    this.buildData(tokens);
  }

  buildData(tokens: marked.Token[]) {
    for (const token of tokens) {
      if (token.type === 'table') {
        this.processTable.headers = token.header;
        this.processTable.cells = this.transpose(token.cells);

        this.headerSize = this.processTable.headers.length;
      }
    }
  }

  transpose(arr: any[][]) {
    return zip.apply(this, arr);
  }

  getHeaderColumn() {
    return {
      width: `calc(100% / ${this.headerSize} - 10px)`
    };
  }

  getColumnStyle() {
    return {
      width: `calc(100% / ${this.headerSize} - 4px)`
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
