import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeHelperComponent } from './ledge-helper.component';
import { SharedModule } from '../../shared/shared.module';
import { LedgeHelperModule } from './ledge-helper.module';

import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';

import 'brace/index';

describe('LedgeHelperComponent', () => {
  let component: LedgeHelperComponent;
  let fixture: ComponentFixture<LedgeHelperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        LedgeHelperModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader,
          },
        }),
      ],
      declarations: [LedgeHelperComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
