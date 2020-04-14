import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentChecklistComponent } from './component-checklist.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { StorageService } from '../../services/storage.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('ChecklistComponent', () => {
  let component: ComponentChecklistComponent;
  let fixture: ComponentFixture<ComponentChecklistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [StorageService],
      declarations: []
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
