import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { LedgeTable } from '../model/ledge-chart.model';

@Component({
  selector: 'ledge-table-step',
  templateUrl: './ledge-table-step.component.html',
  styleUrls: ['./ledge-table-step.component.scss'],
})
export class LedgeTableStepComponent implements OnInit, AfterViewInit {
  @Input() data: LedgeTable = {
    header: [],
    cells: [],
  };
  @Input() config = {
    rowHeight: '',
    column: 4,
    colors: [],
  };

  @ViewChild('tableStep')
  tableStepEl: ElementRef;

  column = 4;
  rowHeight = '430px';
  rowNums = [];
  headers = [];

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {

    this.column = this.config.column || this.column;
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

    this.rowHeight = this.config.rowHeight || this.rowHeight;
  }

  ngAfterViewInit(): void {
    // 动态设置每行step 宽度，使得对齐和自动箭头换行
    const firstRowEl = this.elementRef.nativeElement.querySelector(
      '.first-row'
    );

    const rowWidth = Array.from(firstRowEl.children).reduce(
      (totalWidth: number, c) => {
        const width = (c as HTMLDivElement).getBoundingClientRect().width;
        return totalWidth + width;
      },
      0
    );

    this.renderer.setStyle(
      this.tableStepEl.nativeElement,
      'width',
      `${(rowWidth as number) - 68}px`
    );
  }

  isShowIconBeforeCard(data, hIndex, column, index, last, lastH) {
    return (
      ((hIndex + 1) % 2 === 0 &&
        hIndex * column + index !== data.header.length - 1) ||
      (!last && lastH && this.headers.length > 1 && (hIndex + 1) % 2 === 0)
    );
  }

  isShowIconAfterCard(data, hIndex, column, index) {
    return (
      (hIndex + 1) % 2 !== 0 &&
      hIndex * column + index !== data.header.length - 1
    );
  }
}
