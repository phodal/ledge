import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ComponentTodoComponent } from './component-todo.component';
import { LedgeStorageService } from '../../services/ledge-storage.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('TodoComponent', () => {
  let component: ComponentTodoComponent;
  let fixture: ComponentFixture<ComponentTodoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [LedgeStorageService],
      declarations: [ComponentTodoComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentTodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
