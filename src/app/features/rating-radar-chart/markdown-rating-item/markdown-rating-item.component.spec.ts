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
});
