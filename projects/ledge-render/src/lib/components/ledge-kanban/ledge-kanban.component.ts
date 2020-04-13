import { Component, Input, OnInit } from '@angular/core';
import { LedgeListItem } from '../model/ledge-chart.model';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Column } from './model/column';
import { Board } from './model/board';

@Component({
  selector: 'ledge-kanban',
  templateUrl: './ledge-kanban.component.html',
  styleUrls: ['./ledge-kanban.component.scss']
})
export class LedgeKanbanComponent implements OnInit {
  @Input()
  data: LedgeListItem[];

  @Input()
  config: any;

  board: Board = new Board('Test Board', [
    new Column('Ideas', [
      'Some random idea',
      'This is another random idea',
      'build an awesome application'
    ]),
    new Column('Research', [
      'Lorem ipsum',
      'foo',
      'This was in the \'Research\' column'
    ]),
    new Column('Todo', [
      'Get to work',
      'Pick up groceries',
      'Go home',
      'Fall asleep'
    ]),
    new Column('Done', [
      'Get up',
      'Brush teeth',
      'Take a shower',
      'Check e-mail',
      'Walk dog'
    ])
  ]);

  constructor() {
  }

  ngOnInit(): void {
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
