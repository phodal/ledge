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
  width = '1080px'; // TODO: 根据column 数量动态宽度

  constructor() {
  }

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

  isShowIconBeforeCard(data, hIndex, column, index, last, lastH) {
    return (hIndex + 1) % 2 === 0 && (hIndex * column + index) !== data.header.length - 1 || (!last && lastH) && this.headers.length > 1;
  }
}
