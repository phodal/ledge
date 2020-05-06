import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaturityItemComponent } from './maturity-item.component';
import { SharedModule } from '../../../shared/shared.module';

describe('MaturityComponent', () => {
  let component: MaturityItemComponent;
  let fixture: ComponentFixture<MaturityItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
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
