import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { LedgeRenderModule } from '@ledge-framework/render';

import { CustomMaterialModule } from '../../custom-material.module';
import { SharedModule } from '../../shared.module';
import { LedgeMultipleDocsComponent } from './ledge-multiple-docs.component';

describe('LedgeMultipleDocsComponent', () => {
  let component: LedgeMultipleDocsComponent;
  let fixture: ComponentFixture<LedgeMultipleDocsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RouterTestingModule,
        LedgeRenderModule,
        CustomMaterialModule,
        BrowserAnimationsModule,
        BrowserTestingModule,
        HttpClientModule,
      ],
      declarations: [LedgeMultipleDocsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeMultipleDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
