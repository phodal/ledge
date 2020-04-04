import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarkdownTaskItemService {
  private taskList = [];
  private tasks: any;
  private subject = new Subject<any>();

  update(tasks) {
    this.subject.next(tasks);
  }

  subTasks(channel): Observable<any> {
    return this.subject.asObservable();
  }

  setTasks(key, tasks: any) {
    this.taskList[key] = tasks;
  }

  updateTask($event: any, instanceKey, item) {
    if (!item.id) {
      return;
    }

    const tasks = this.updateTaskByItem(this.taskList[instanceKey], item);
    this.update(tasks);

    return tasks;
  }

  updateTaskByItem(tasks, item) {
    for (const task of tasks) {
      if (task.item.id === item.id) {
        task.item = JSON.parse(JSON.stringify(item));
        return tasks;
      }

      if (task.children) {
        this.updateTaskByItem(task.children, item);
      }
    }

    return tasks;
  }
}
