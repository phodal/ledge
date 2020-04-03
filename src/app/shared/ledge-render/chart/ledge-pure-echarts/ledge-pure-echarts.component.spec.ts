import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgePureEchartsComponent } from './ledge-pure-echarts.component';

describe('LedgePureEchartsComponent', () => {
  let component: LedgePureEchartsComponent;
  let fixture: ComponentFixture<LedgePureEchartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LedgePureEchartsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgePureEchartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
