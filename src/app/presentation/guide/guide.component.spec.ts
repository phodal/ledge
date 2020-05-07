import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LedgeRenderModule } from '@ledge-framework/render';
import { RouterTestingModule } from '@angular/router/testing';

import { GuideComponent } from './guide.component';
import { SharedModule } from '../../shared/shared.module';
import { CustomMaterialModule } from '../../shared/custom-material.module';

describe('GuideComponent', () => {
  let component: GuideComponent;
  let fixture: ComponentFixture<GuideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CustomMaterialModule,
        LedgeRenderModule,
        RouterTestingModule,
      ],
      declarations: [GuideComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
