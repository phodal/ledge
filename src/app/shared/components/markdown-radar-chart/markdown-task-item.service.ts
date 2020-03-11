import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarkdownTaskItemService {
  private tasks: any;
  private subject = new Subject<any>();

  update(tasks) {
    this.subject.next(tasks);
  }

  subTasks(channel): Observable<any> {
    return this.subject.asObservable();
  }

  setTasks(tasks: any) {
    this.tasks = tasks;
  }

  updateTask($event: any, item) {
    if (!item.id) {
      return;
    }

    const tasks = this.updateTaskByItem(this.tasks, item);
    this.update(tasks);

    return tasks;
  }

  deleteTask(item) {
    if (!item.id) {
      return;
    }

    const tasks = this.deleteTaskByItem(this.tasks, item);
    this.update(tasks);

    return tasks;
  }

  deleteTaskByItem(tasks: any, item: any) {
    for (let i = 0; i < tasks.length; i++) {
      let task = tasks[i];
      if (task.item.id === item.id) {
        tasks.splice(i, 1);
        return tasks;
      }

      if (task.childrens) {
        task = this.deleteTaskByItem(task.childrens, item);
      }
    }

    return tasks;
  }

  addTask(item, name: string) {
    if (!item) {
      this.tasks.push({
        item: {
          text: name
        }
      });

      return this.tasks;
    }
    return this.addTaskByItem(this.tasks, item, name);
  }

  addTaskByItem(tasks, item, name) {
    for (const task of tasks) {
      if (task.item.id === item.id) {
        const newItem = {
          item: {
            text: name
          }
        };

        if (task.childrens) {
          task.childrens.push(newItem);
        } else {
          task.childrens = [newItem];
        }
        return tasks;
      }

      if (task.childrens) {
        this.addTaskByItem(task.childrens, item, name);
      }
    }

    return tasks;
  }

  updateTaskByItem(tasks, item) {
    for (const task of tasks) {
      if (task.item.id === item.id) {
        task.item = JSON.parse(JSON.stringify(item));
        return tasks;
      }

      if (task.childrens) {
        this.updateTaskByItem(task.childrens, item);
      }
    }

    return tasks;
  }
}
