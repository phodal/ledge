import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeHeatmapComponent } from './ledge-heatmap.component';

describe('LedgeHeatmapComponent', () => {
  let component: LedgeHeatmapComponent;
  let fixture: ComponentFixture<LedgeHeatmapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LedgeHeatmapComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeHeatmapComponent);
    component = fixture.componentInstance;
    component.data = {
      header: ['h1', 'h1'],
      cells: [
        ['a', 'b'],
        ['a', 'b']
      ]
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
