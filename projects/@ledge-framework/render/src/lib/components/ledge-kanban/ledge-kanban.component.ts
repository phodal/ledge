import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LedgeListItem } from '../model/ledge-chart.model';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Column } from './model/column';
import { Board } from './model/board';

@Component({
  selector: 'ledge-kanban',
  templateUrl: './ledge-kanban.component.html',
  styleUrls: ['./ledge-kanban.component.scss']
})
export class LedgeKanbanComponent implements OnInit, OnChanges {
  @Input()
  data: LedgeListItem[];

  @Input()
  config: any;

  board: Board = new Board('', []);

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateKanbanData();
  }

  private updateKanbanData() {
    if (this.data.length <= 0) {
      return;
    }

    const kanbanData = this.data[0];

    this.board = new Board(kanbanData.name, []);
    for (const column of kanbanData.children) {
      const col = new Column(column.name, []);
      if (!!column.children) {
        for (const cell of column.children) {
          col.tasks.push(cell.name);
        }
      }
      this.board.columns.push(col);
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }
}
