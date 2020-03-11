import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownRatingComponent } from './markdown-rating.component';
import { SharedModule } from '../../../shared.module';
import { FeaturesModule } from '../../../../features/features.module';
import { MarkdownModule } from 'ngx-markdown';

describe('MarkdownRatingComponent', () => {
  let component: MarkdownRatingComponent;
  let fixture: ComponentFixture<MarkdownRatingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, FeaturesModule, MarkdownModule],
      declarations: [ MarkdownRatingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
