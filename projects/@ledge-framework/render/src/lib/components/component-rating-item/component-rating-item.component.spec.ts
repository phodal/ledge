import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentRatingItemComponent } from './component-rating-item.component';
import { MarkdownModule } from 'ngx-markdown';
import { LedgeRenderModule } from '../../ledge-render.module';

describe('MarkdownRatingItemComponent', () => {
  let component: ComponentRatingItemComponent;
  let fixture: ComponentFixture<ComponentRatingItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [LedgeRenderModule, MarkdownModule],
      declarations: [ComponentRatingItemComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentRatingItemComponent);
    component = fixture.componentInstance;
    component.item = {
      id: '',
      name: '23442'
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
