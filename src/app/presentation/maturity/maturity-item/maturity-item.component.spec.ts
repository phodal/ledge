import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaturityItemComponent } from './maturity-item.component';
import { SharedModule } from '../../../shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';

describe('MaturityComponent', () => {
  let component: MaturityItemComponent;
  let fixture: ComponentFixture<MaturityItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule, SharedModule, FormsModule, ReactiveFormsModule],
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
