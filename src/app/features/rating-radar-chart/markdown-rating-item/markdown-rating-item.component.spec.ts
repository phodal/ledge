import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownRatingItemComponent } from './markdown-rating-item.component';
import { SharedModule } from '../../../shared/shared.module';
import { MarkdownModule } from 'ngx-markdown';

describe('MarkdownRatingItemComponent', () => {
  let component: MarkdownRatingItemComponent;
  let fixture: ComponentFixture<MarkdownRatingItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, SharedModule, MarkdownModule],
      declarations: [MarkdownRatingItemComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownRatingItemComponent);
    component = fixture.componentInstance;
    component.item = {
      id: '',
      completed: false,
      text: '23442',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reg touch', () => {
    const mockTouch = jasmine.createSpy('touch');
    component.registerOnTouched(mockTouch);
    component.onTouched({});
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
});
