import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeQuadrantComponent } from './ledge-quadrant.component';
import { SharedModule } from '../../../shared.module';

describe('LedgeQuadrantComponent', () => {
  let component: LedgeQuadrantComponent;
  let fixture: ComponentFixture<LedgeQuadrantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [LedgeQuadrantComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeQuadrantComponent);
    component = fixture.componentInstance;
    component.data = {
      children: [
        {
          name: 'parent',
          children: [
            { name: 'child', children: [{ name: '' }] },
            { name: 'child', children: [{ name: '' }] },
            { name: 'child', children: [{ name: '' }] },
            { name: 'child', children: [{ name: '' }] },
          ],
        },
      ],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
