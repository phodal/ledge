import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { TodoModel } from '../model/todo.model';
import { LedgeStorageService } from '../../services/ledge-storage.service';

@Component({
  selector: 'component-todo',
  templateUrl: './component-todo.component.html',
  styleUrls: ['./component-todo.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComponentTodoComponent),
      multi: true
    }
  ]
})
export class ComponentTodoComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() form: FormGroup;
  @Input() toDos: TodoModel[] = [];
  @Input() disableInput = false;

  @Output() formChange = new EventEmitter<any>();

  private unsubscribe = new Subject<void>();
  private disabled = false;

  onChange(change: any) {
  }

  onTouched() {
  }

  constructor(private formBuilder: FormBuilder, private storage: LedgeStorageService) {
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      todo: ['', [
        Validators.required,
        Validators.minLength(2)
      ]]
    });

    this.form.valueChanges.subscribe(() => {
      this.formChange.emit(this.form);
    });
  }

  addToDo(value) {
    this.toDos.push({
      id: Math.random(),
      checked: false,
      name: value
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  completeChange($event: MatCheckboxChange, toDo: TodoModel) {
    toDo.checked = $event.checked;
    this.onChange(this.toDos);
  }

  submitTodo() {
    if (this.form.valid) {
      this.addToDo(this.form.value.todo);
      this.form.controls.todo.setValue(null);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: any): void {
    if (value !== null && value !== undefined) {
      this.toDos = value;
    }
  }
}
