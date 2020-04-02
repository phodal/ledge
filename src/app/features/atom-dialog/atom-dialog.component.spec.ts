import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AtomDialogComponent } from './atom-dialog.component';
import { SharedModule } from '../../shared/shared.module';

describe('AtomDialogComponent', () => {
  let component: AtomDialogComponent;
  let fixture: ComponentFixture<AtomDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [AtomDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AtomDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
