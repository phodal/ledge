import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeEditorComponent } from './ledge-editor.component';
import { SharedModule } from '../../shared/shared.module';
import { LedgeEditorModule } from './ledge-editor.module';

import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';

import 'brace/index';

describe('LedgeHelperComponent', () => {
  let component: LedgeEditorComponent;
  let fixture: ComponentFixture<LedgeEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        LedgeEditorModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader,
          },
        }),
      ],
      declarations: [LedgeEditorComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
