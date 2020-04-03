import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeGraphvizComponent } from './ledge-graphviz.component';

describe('LedgeGraphvizComponent', () => {
  let component: LedgeGraphvizComponent;
  let fixture: ComponentFixture<LedgeGraphvizComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LedgeGraphvizComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeGraphvizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
