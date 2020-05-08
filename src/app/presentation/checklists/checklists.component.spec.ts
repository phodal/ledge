import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistsComponent } from './checklists.component';
import { SharedModule } from '../../shared/shared.module';
import { LedgeRenderModule } from '@ledge-framework/render';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('ChecklistsComponent', () => {
  let component: ChecklistsComponent;
  let fixture: ComponentFixture<ChecklistsComponent>;
  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CustomMaterialModule,
        LedgeRenderModule,
        BrowserAnimationsModule,
        RouterTestingModule,
      ],
      declarations: [ChecklistsComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            fragment: of({}),
            paramMap: of(convertToParamMap({ name: 'new-project' })),
          },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });
});
