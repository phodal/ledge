import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeChecklistComponent } from './ledge-checklist.component';

describe('LedgeChecklistComponent', () => {
  let component: LedgeChecklistComponent;
  let fixture: ComponentFixture<LedgeChecklistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedgeChecklistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
