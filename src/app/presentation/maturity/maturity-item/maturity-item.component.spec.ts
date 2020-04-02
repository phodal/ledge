import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaturityItemComponent } from './maturity-item.component';

describe('MaturityComponent', () => {
  let component: MaturityItemComponent;
  let fixture: ComponentFixture<MaturityItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MaturityItemComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaturityItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
