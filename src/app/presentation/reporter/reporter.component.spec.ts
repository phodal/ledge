import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporterComponent } from './reporter.component';
import { SharedModule } from '../../shared/shared.module';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { LedgeRenderModule } from '@ledge-framework/render';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

describe('ReporterComponent', () => {
  let component: ReporterComponent;
  let fixture: ComponentFixture<ReporterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        CustomMaterialModule,
        LedgeRenderModule,
        RouterTestingModule,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            fragment: of({}),
            paramMap: of(convertToParamMap({ year: '2019' })),
          },
        },
      ],
      declarations: [ReporterComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });
});
