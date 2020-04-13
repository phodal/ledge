import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeKanbanComponent } from './ledge-kanban.component';

describe('LedgeKanbanComponent', () => {
  let component: LedgeKanbanComponent;
  let fixture: ComponentFixture<LedgeKanbanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedgeKanbanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeKanbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
