import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingRadarChartComponent } from './rating-radar-chart.component';
import { SharedModule } from '../../shared.module';
import { MarkdownModule } from 'ngx-markdown';

describe('MarkdownRadarChartComponent', () => {
  let component: RatingRadarChartComponent;
  let fixture: ComponentFixture<RatingRadarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, SharedModule, MarkdownModule],
      declarations: [RatingRadarChartComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingRadarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
