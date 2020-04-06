import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeCardComponent } from './ledge-card.component';

describe('LedgeCardComponent', () => {
  let component: LedgeCardComponent;
  let fixture: ComponentFixture<LedgeCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedgeCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
