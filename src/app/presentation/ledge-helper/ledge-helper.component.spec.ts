import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeHelperComponent } from './ledge-helper.component';
import { SharedModule } from '../../shared/shared.module';

describe('LedgeHelperComponent', () => {
  let component: LedgeHelperComponent;
  let fixture: ComponentFixture<LedgeHelperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [LedgeHelperComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
