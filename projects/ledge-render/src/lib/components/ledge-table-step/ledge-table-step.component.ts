import { Component, OnInit, Input } from '@angular/core';
import { LedgeTable } from '../model/ledge-chart.model';

@Component({
  selector: 'ledge-table-step',
  templateUrl: './ledge-table-step.component.html',
  styleUrls: ['./ledge-table-step.component.scss'],
})
export class LedgeTableStepComponent implements OnInit {
  @Input() data: LedgeTable = {
    header: [],
    cells: [],
  };
  @Input() config = {
    colors: [],
  };

  column = 4;
  rowNums = [];
  headers = [];

  constructor() {}

  ngOnInit(): void {
    // TODO: 动态分组，动态宽度每行列数，目前默认为4
    const headerLen = this.data.header.length;
    const rowNum = Math.ceil(headerLen / this.column);

    let i = 0;
    while (i < rowNum && headerLen) {
      const currentIdx = i * this.column;
      const endIdx = i !== rowNum - 1 ? currentIdx + this.column : headerLen;
      const arr = this.data.header.slice(currentIdx, endIdx);
      this.headers.push(arr);
      i++;
    }
  }
}
