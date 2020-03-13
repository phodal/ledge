import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownTreeComponent } from './markdown-tree.component';

describe('MarkdownTreeComponent', () => {
  let component: MarkdownTreeComponent;
  let fixture: ComponentFixture<MarkdownTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkdownTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
