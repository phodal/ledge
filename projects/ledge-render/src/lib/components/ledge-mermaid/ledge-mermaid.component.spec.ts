import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeMermaidComponent } from './ledge-mermaid.component';
import { TohtmlPipe } from '../../pipes/tohtml.pipe';

describe('LedgeMermaidComponent', () => {
  let component: LedgeMermaidComponent;
  let fixture: ComponentFixture<LedgeMermaidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LedgeMermaidComponent, TohtmlPipe],
    }).compileComponents();
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
