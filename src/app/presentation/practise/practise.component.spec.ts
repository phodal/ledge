import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PractiseComponent } from './practise.component';
import { SharedModule } from '../../shared/shared.module';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { LedgeRenderModule } from '@ledge-framework/render';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { ThinkTankComponent } from '../think-tank/think-tank.component';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

describe('PractiseComponent', () => {
  let component: PractiseComponent;
  let fixture: ComponentFixture<PractiseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RouterTestingModule,
        LedgeRenderModule,
        CustomMaterialModule,
        BrowserAnimationsModule,
        BrowserTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader,
          },
        }),
      ],
      declarations: [PractiseComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            fragment: of({}),
            paramMap: of(convertToParamMap({ practise: 'devops-practise' })),
          },
        },
      ],
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
