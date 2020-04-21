import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporterComponent } from './reporter.component';
import { SharedModule } from '../../shared/shared.module';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { LedgeRenderModule } from '@ledge-framework/render';
import { RouterTestingModule } from '@angular/router/testing';

describe('ReporterComponent', () => {
  let component: ReporterComponent;
  let fixture: ComponentFixture<ReporterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CustomMaterialModule,
        LedgeRenderModule,
        RouterTestingModule,
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
