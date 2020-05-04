import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MarkdownModule } from 'ngx-markdown';

import { SharedModule } from '../../shared/shared.module';
import { RatingRadarChartComponent } from './rating-radar-chart.component';

describe('MarkdownRadarChartComponent', () => {
  let component: RatingRadarChartComponent;
  let fixture: ComponentFixture<RatingRadarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, MarkdownModule],
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

  it('should change', () => {
    component.onChange('aa');
    component.onTouched();
    expect(component.value).toEqual('aa');
  });

  it('should reg touch', () => {
    const mockTouch = jasmine.createSpy('touch');
    component.registerOnTouched(mockTouch);
    component.onTouched();
    expect(mockTouch).toHaveBeenCalled();
  });

  it('should reg change', () => {
    const mockChange = jasmine.createSpy('change');
    component.registerOnChange(mockChange);
    component.onChange('a');
    expect(mockChange).toHaveBeenCalled();
  });

  it('should change state', () => {
    component.setDisabledState(true);
    expect(component.disabled).toEqual(true);
  });

  it('should call change when update model', () => {
    spyOn(component, 'onChange');
    component.updateModel({});
    expect(component.onChange).toHaveBeenCalled();
  });

  it('should render when write value', () => {
    const originText = '需求管理: 2';
    const chartData = [
      {
        item: {
          originText,
          id: 'TDUJCTBda',
          completed: false,
          text: originText,
          chartText: '需求管理',
          chartValue: 2,
        },
      },
    ];
    component.writeValue(chartData);
    expect(component.data.length).toEqual(1);
    expect(component.data[0].name).toEqual(originText);
  });
});
