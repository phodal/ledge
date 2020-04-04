import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AtomComponent } from './atom.component';
import { SharedModule } from '../../../shared/shared.module';

describe('AtomComponent', () => {
  let component: AtomComponent;
  let fixture: ComponentFixture<AtomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
      ],
      declarations: [AtomComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AtomComponent);
    component = fixture.componentInstance;
    component.data = '';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
