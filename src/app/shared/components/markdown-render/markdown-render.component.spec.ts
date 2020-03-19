import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownRenderComponent } from './markdown-render.component';
import { SharedModule } from '../../shared.module';

describe('MarkdownRenderComponent', () => {
  let component: MarkdownRenderComponent;
  let fixture: ComponentFixture<MarkdownRenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ MarkdownRenderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownRenderComponent);
    component = fixture.componentInstance;
    component.src = '/assets/docs/manual.md';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
