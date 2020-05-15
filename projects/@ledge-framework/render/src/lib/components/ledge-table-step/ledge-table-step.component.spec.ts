import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeTableStepComponent } from './ledge-table-step.component';

describe('LedgeTableStepComponent', () => {
  let component: LedgeTableStepComponent;
  let fixture: ComponentFixture<LedgeTableStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedgeTableStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeTableStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
