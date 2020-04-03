import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LedgePyramidComponent } from './ledge-pyramid.component';

describe('LedgePyramidComponent', () => {
  let component: LedgePyramidComponent;
  let fixture: ComponentFixture<LedgePyramidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LedgePyramidComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgePyramidComponent);
    component = fixture.componentInstance;
    component.data = {
      children: [
        {
          children: [
            {
              children: [],
              name: '',
            },
          ],
          name: '',
        },
      ],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
