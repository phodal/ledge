import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownChartComponent } from './markdown-chart.component';

describe('MarkdownChartComponent', () => {
  let component: MarkdownChartComponent;
  let fixture: ComponentFixture<MarkdownChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkdownChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
