import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeGraphvizComponent } from './ledge-graphviz.component';
import { SharedModule } from '../../../shared.module';

describe('LedgeGraphvizComponent', () => {
  let component: LedgeGraphvizComponent;
  let fixture: ComponentFixture<LedgeGraphvizComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [LedgeGraphvizComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeGraphvizComponent);
    component = fixture.componentInstance;
    component.data = `digraph {}`;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
