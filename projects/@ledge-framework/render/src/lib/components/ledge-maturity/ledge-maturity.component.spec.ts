import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeMaturityComponent } from './ledge-maturity.component';

describe('LedgeMaturityComponent', () => {
  let component: LedgeMaturityComponent;
  let fixture: ComponentFixture<LedgeMaturityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedgeMaturityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeMaturityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
