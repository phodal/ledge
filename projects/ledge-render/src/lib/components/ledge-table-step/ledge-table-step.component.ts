import {
  AfterViewInit,
  ChangeDetectorRef,
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
  rowHeight = '430px'; // card column 的高度
  stepRowHeight = '430px'; // 每行高度
  rowNums = [];
  headers = [];

  itemWidth = 288; // 每个item 最小占用宽度
  arrowWidth = 68; // 每个箭头占用宽度

  constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  init() {
    this.headers = [];
    this.column = this.config.column || this.column;
    const headerLen = this.data.header.length;
    const rowNum = Math.ceil(headerLen / this.column);

    let i = 0;
    const tempHeaders = [];
    while (i < rowNum && headerLen) {
      const currentIdx = i * this.column;
      const endIdx = i !== rowNum - 1 ? currentIdx + this.column : headerLen;
      const arr = this.data.header.slice(currentIdx, endIdx);
      tempHeaders.push(arr);
      i++;
    }
    this.headers = [...tempHeaders];
    this.rowHeight = this.config.rowHeight || this.rowHeight;
    this.stepRowHeight = Number(this.rowHeight.replace('px', '')) + 44 + 'px';
  }

  ngAfterViewInit(): void {
    // 依赖父级div宽度做自适应
    const parentContainer = this.tableStepEl.nativeElement.parentElement
      .parentElement;
    const parentContainerWidth = parentContainer.getBoundingClientRect().width;

    // 当前宽度自动判断最大列数，最小不小于4列
    if (
      !this.config.column &&
      Math.ceil(parentContainerWidth / this.itemWidth) > 4
    ) {
      const c = parentContainerWidth / this.itemWidth;
      // 最后一列剩余70% 的空间可以强行多一列，避免空白过多不美观
      this.column =
        `0.${String(c).split('.')[1]}` > '0.7' ? Math.ceil(c) : Math.floor(c);
    }
    this.init();

    // 动态设置每行step 宽度，使得对齐和自动箭头换行
    const rowWidth = this.column * this.itemWidth - this.arrowWidth;
    this.renderer.setStyle(
      this.tableStepEl.nativeElement,
      'width',
      `${rowWidth}px`
    );
    this.cdr.detectChanges();
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
