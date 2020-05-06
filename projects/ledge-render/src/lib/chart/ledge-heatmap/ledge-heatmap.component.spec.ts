import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeHeatmapComponent } from './ledge-heatmap.component';

describe('LedgeHeatmapComponent', () => {
  let component: LedgeHeatmapComponent;
  let fixture: ComponentFixture<LedgeHeatmapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedgeHeatmapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
