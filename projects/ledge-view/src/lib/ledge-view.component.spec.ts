import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeViewComponent } from './ledge-view.component';

describe('LedgeViewComponent', () => {
  let component: LedgeViewComponent;
  let fixture: ComponentFixture<LedgeViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedgeViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
