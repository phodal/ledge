import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeSunburstComponent } from './ledge-sunburst.component';

describe('LedgeSunburstComponent', () => {
  let component: LedgeSunburstComponent;
  let fixture: ComponentFixture<LedgeSunburstComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedgeSunburstComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeSunburstComponent);
    component = fixture.componentInstance;
    component.data = [{
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
    }];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
