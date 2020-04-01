import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThinkTankComponent } from './think-tank.component';

describe('ThinkTankComponent', () => {
  let component: ThinkTankComponent;
  let fixture: ComponentFixture<ThinkTankComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThinkTankComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThinkTankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
