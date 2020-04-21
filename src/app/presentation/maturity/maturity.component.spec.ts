import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaturityComponent } from './maturity.component';
import { SharedModule } from '../../shared/shared.module';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { LedgeRenderModule } from 'ledge-render';
import { RouterTestingModule } from '@angular/router/testing';
import { MaturityItemComponent } from './maturity-item/maturity-item.component';

describe('MaturityComponent', () => {
  let component: MaturityComponent;
  let fixture: ComponentFixture<MaturityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CustomMaterialModule,
        LedgeRenderModule,
        RouterTestingModule,
      ],
      declarations: [MaturityComponent, MaturityItemComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaturityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
