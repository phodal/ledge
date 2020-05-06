import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeMultipleDocsComponent } from './ledge-multiple-docs.component';

describe('LedgeMultipleDocsComponent', () => {
  let component: LedgeMultipleDocsComponent;
  let fixture: ComponentFixture<LedgeMultipleDocsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LedgeMultipleDocsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeMultipleDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
