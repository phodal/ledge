import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgePieComponent } from './ledge-pie.component';

describe('LedgePieComponent', () => {
  let component: LedgePieComponent;
  let fixture: ComponentFixture<LedgePieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedgePieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgePieComponent);
    component = fixture.componentInstance;
    component.data = [{
      name: '',
      children: []
    }];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
