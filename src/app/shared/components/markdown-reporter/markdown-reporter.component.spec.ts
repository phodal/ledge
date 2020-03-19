import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkdownReporterComponent } from './markdown-reporter.component';

describe('MarkdownReporterComponent', () => {
  let component: MarkdownReporterComponent;
  let fixture: ComponentFixture<MarkdownReporterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkdownReporterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownReporterComponent);
    component = fixture.componentInstance;
    component.content = ``;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
