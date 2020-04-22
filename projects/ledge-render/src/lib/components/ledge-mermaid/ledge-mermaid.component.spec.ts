import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeMermaidComponent } from './ledge-mermaid.component';

describe('LedgeMermaidComponent', () => {
  let component: LedgeMermaidComponent;
  let fixture: ComponentFixture<LedgeMermaidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedgeMermaidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeMermaidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
