import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownRatingComponent } from './markdown-rating.component';
import { SharedModule } from '../../../shared/shared.module';
import { MarkdownModule } from 'ngx-markdown';

describe('MarkdownRatingComponent', () => {
  let component: MarkdownRatingComponent;
  let fixture: ComponentFixture<MarkdownRatingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, SharedModule, MarkdownModule],
      declarations: [MarkdownRatingComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.onChange('aa');
    component.onTouched({});
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
