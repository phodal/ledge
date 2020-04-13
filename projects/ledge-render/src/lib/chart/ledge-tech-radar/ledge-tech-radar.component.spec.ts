import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeTechRadarComponent } from './ledge-tech-radar.component';

describe('LedgeTechRadarComponent', () => {
  let component: LedgeTechRadarComponent;
  let fixture: ComponentFixture<LedgeTechRadarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedgeTechRadarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeTechRadarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
