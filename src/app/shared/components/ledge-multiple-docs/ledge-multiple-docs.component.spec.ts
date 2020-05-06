import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeMultipleDocsComponent } from './ledge-multiple-docs.component';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { LedgeRenderModule } from 'ledge-render';
import { CustomMaterialModule } from '../../custom-material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserTestingModule } from '@angular/platform-browser/testing';

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
