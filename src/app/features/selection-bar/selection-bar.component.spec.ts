import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionBarComponent } from './selection-bar.component';

describe('SelectionBarComponent', () => {
  let component: SelectionBarComponent;
  let fixture: ComponentFixture<SelectionBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectionBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
