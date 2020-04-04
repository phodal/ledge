import { Component, Input, OnInit } from '@angular/core';
import marked from 'marked/lib/marked';
import MarkdownHelper from '../../../shared/model/markdown.helper';
import { MarkdownTaskItemService } from '../../../features/rating-radar-chart/markdown-task-item.service';
import { MarkdownListModel } from '../../../shared/model/markdown.model';
import { StorageMap } from '@ngx-pwa/local-storage';

@Component({
  selector: 'app-maturity-item',
  templateUrl: './maturity-item.component.html',
  styleUrls: ['./maturity-item.component.scss'],
})
export class MaturityItemComponent implements OnInit {
  @Input()
  data: any = {
    name: '',
    key: '',
    value: '',
  };

  tasks: any;
  private tempValue: string;
  private taskIndex: number;
  private indexString: string;

  constructor(
    private markdownTaskItemService: MarkdownTaskItemService,
    private storage: StorageMap
  ) {}

  ngOnInit(): void {
    this.storage
      .get('maturity-item.' + this.data.key)
      .subscribe((value: string) => {
        if (!!value) {
          this.data.value = value;
        }

        this.updateValue(this.data.value);
      });
  }

  updateValue(value) {
    this.data.value = value;
    const tokens = marked.lexer(this.data.value);
    this.tasks = MarkdownHelper.markdownToJSON(tokens, this.tasks);
    this.markdownTaskItemService.setTasks(this.data.key, this.tasks);

    this.storage
      .set('maturity-item.' + this.data.key, this.data.value)
      .subscribe(() => {});
  }

  updateModel($event: any) {
    this.taskIndex = 0;
    this.tempValue = '';
    this.indexString = '';

    this.taskToMarkdownList($event);
    this.tempValue = this.tempValue.replace(/\$[A-Za-z0-9_-]{7,14}/g, '');
    this.updateValue(this.tempValue);
  }

  taskToMarkdownList(tasks: any, hasChildren = false) {
    this.taskIndex++;

    for (const task of tasks) {
      if (task.item) {
        const item = task.item as MarkdownListModel;
        if (this.taskIndex > 1) {
          this.indexString = '  '.repeat(this.taskIndex);
        }
        this.tempValue += this.indexString + ` -`;
        if (item.id) {
          this.tempValue += ` $${item.id}`;
        }

        this.tempValue += ` ${item.text}`;

        this.tempValue += `\n`;
        this.indexString = '';
      }

      if (task.children) {
        this.taskToMarkdownList(task.children, hasChildren);
      }
    }

    if (!hasChildren) {
      this.taskIndex--;
    }
  }
}
