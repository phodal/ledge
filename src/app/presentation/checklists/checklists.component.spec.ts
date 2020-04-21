import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistsComponent } from './checklists.component';
import { SharedModule } from '../../shared/shared.module';
import { LedgeRenderModule } from '@ledge-framework/render';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ChecklistsComponent', () => {
  let component: ChecklistsComponent;
  let fixture: ComponentFixture<ChecklistsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CustomMaterialModule,
        LedgeRenderModule,
        BrowserAnimationsModule,
      ],
      declarations: [ChecklistsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change table', () => {
    component.onTabChanged({ index: 1 } as any);
    expect(component.selectedTabIndex).toEqual(1);
  });
});
