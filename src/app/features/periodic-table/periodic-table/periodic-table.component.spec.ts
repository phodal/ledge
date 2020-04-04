import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodicTableComponent } from './periodic-table.component';
import { SharedModule } from '../../../shared/shared.module';

describe('PeriodicTableComponent', () => {
  let component: PeriodicTableComponent;
  let fixture: ComponentFixture<PeriodicTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [PeriodicTableComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodicTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
