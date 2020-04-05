import { Component, OnInit, Input } from '@angular/core';
import colors from './colors';

interface CardData {
  header: string;
  cells: string[];
  index?: number;
}

interface HeaderStyle {
  bg: string;
  font: string;
}

@Component({
  selector: 'ledge-card',
  templateUrl: './ledge-card.component.html',
  styleUrls: ['./ledge-card.component.scss'],
})
export class LedgeCardComponent implements OnInit {
  @Input()
  data: CardData = {
    header: '',
    cells: [],
    index: -1,
  };
  @Input()
  headerStyle: HeaderStyle = {
    bg: '#fff',
    font: '#333',
  };

  constructor() {}

  ngOnInit(): void {}

  /* TODO：更好的实现方式 */
  getHeaderStyle() {
    let idx = this.data.index;

    if (!idx && idx !== 0) {
      idx = Math.floor(Math.random() * 10);
    }
    const bgColor = (this.headerStyle && this.headerStyle.bg) || colors[idx];
    const fontColor = (this.headerStyle && this.headerStyle.font) || '#333';

    return {
      'background-color': bgColor,
      color: fontColor,
    };
  }
}
