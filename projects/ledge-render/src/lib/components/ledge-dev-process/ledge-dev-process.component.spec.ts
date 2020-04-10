import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeDevProcessComponent } from './ledge-dev-process.component';

describe('LedgeDevProcessComponent', () => {
  let component: LedgeDevProcessComponent;
  let fixture: ComponentFixture<LedgeDevProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedgeDevProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeDevProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
