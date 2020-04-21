import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PractiseComponent } from './practise.component';
import { SharedModule } from '../../shared/shared.module';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { LedgeRenderModule } from '@ledge-framework/render';
import { RouterTestingModule } from '@angular/router/testing';

describe('PractiseComponent', () => {
  let component: PractiseComponent;
  let fixture: ComponentFixture<PractiseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CustomMaterialModule,
        LedgeRenderModule,
        RouterTestingModule,
      ],
      declarations: [PractiseComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PractiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });
});
