import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownRadarChartComponent } from './markdown-radar-chart.component';
import { SharedModule } from '../../shared.module';
import { MarkdownModule } from 'ngx-markdown';

describe('MarkdownRadarChartComponent', () => {
  let component: MarkdownRadarChartComponent;
  let fixture: ComponentFixture<MarkdownRadarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, SharedModule, MarkdownModule],
      declarations: [ MarkdownRadarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownRadarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
