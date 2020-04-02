import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeRadarComponent } from './ledge-radar.component';
import { SharedModule } from '../../../shared.module';

describe('LedgeRadarComponent', () => {
  let component: LedgeRadarComponent;
  let fixture: ComponentFixture<LedgeRadarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [LedgeRadarComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeRadarComponent);
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
