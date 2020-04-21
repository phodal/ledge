import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignComponent } from './design.component';
import { SharedModule } from '../../shared/shared.module';
import { DesignModule } from './design.module';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { LedgeRenderModule } from 'ledge-render';
import { RouterTestingModule } from '@angular/router/testing';

describe('DesignComponent', () => {
  let component: DesignComponent;
  let fixture: ComponentFixture<DesignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CustomMaterialModule,
        DesignModule,
        LedgeRenderModule,
        RouterTestingModule,
      ],
      declarations: [DesignComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
