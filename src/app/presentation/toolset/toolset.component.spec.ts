import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LedgeRenderModule } from '@ledge-framework/render';
import { RouterTestingModule } from '@angular/router/testing';

import { ToolsetComponent } from './toolset.component';
import { SharedModule } from '../../shared/shared.module';
import { CustomMaterialModule } from '../../shared/custom-material.module';

describe('ToolSetComponent', () => {
  let component: ToolsetComponent;
  let fixture: ComponentFixture<ToolsetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CustomMaterialModule,
        LedgeRenderModule,
        RouterTestingModule,
      ],
      declarations: [ToolsetComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });
});
