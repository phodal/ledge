import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownRenderComponent } from './markdown-render.component';

describe('MarkdownRenderComponent', () => {
  let component: MarkdownRenderComponent;
  let fixture: ComponentFixture<MarkdownRenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkdownRenderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
