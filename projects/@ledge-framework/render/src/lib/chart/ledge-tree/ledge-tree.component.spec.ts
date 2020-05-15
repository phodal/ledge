import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeTreeComponent } from './ledge-tree.component';

describe('LedgeTreeComponent', () => {
  let component: LedgeTreeComponent;
  let fixture: ComponentFixture<LedgeTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedgeTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
