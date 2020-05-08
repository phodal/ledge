import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MarkdownModule } from 'ngx-markdown';

import { ComponentRatingComponent } from './component-rating.component';
import { LedgeRenderModule } from '../../ledge-render.module';

describe('MarkdownRatingComponent', () => {
  let component: ComponentRatingComponent;
  let fixture: ComponentFixture<ComponentRatingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LedgeRenderModule, MarkdownModule],
      declarations: [ComponentRatingComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentRatingComponent);
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
