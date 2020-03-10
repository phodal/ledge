import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatternComponent } from './pattern.component';

describe('PatternComponent', () => {
  let component: PatternComponent;
  let fixture: ComponentFixture<PatternComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatternComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
