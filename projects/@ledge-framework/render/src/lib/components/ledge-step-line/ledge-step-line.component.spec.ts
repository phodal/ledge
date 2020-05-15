import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeStepLineComponent } from './ledge-step-line.component';

describe('LedgeStepLineComponent', () => {
  let component: LedgeStepLineComponent;
  let fixture: ComponentFixture<LedgeStepLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedgeStepLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeStepLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
