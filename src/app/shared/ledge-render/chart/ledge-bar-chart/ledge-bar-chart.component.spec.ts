import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LedgeBarChartComponent } from './ledge-bar-chart.component';
import { SharedModule } from '../../../shared.module';

describe('LedgeBarChart', () => {
  let component: LedgeBarChartComponent;
  let fixture: ComponentFixture<LedgeBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [LedgeBarChartComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeBarChartComponent);
    component = fixture.componentInstance;
    component.data = {
      header: [],
      cells: [[]],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
