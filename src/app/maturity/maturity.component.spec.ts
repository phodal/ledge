import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaturityComponent } from './maturity.component';

describe('MaturityComponent', () => {
  let component: MaturityComponent;
  let fixture: ComponentFixture<MaturityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaturityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaturityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
