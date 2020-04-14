import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentChecklistComponent } from './component-checklist.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../../../shared/shared.module';
import { FeaturesModule } from '../../features.module';

describe('ChecklistComponent', () => {
  let component: ComponentChecklistComponent;
  let fixture: ComponentFixture<ComponentChecklistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        SharedModule,
        FeaturesModule
      ],
      declarations: []
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
