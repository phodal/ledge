import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { RouterTestingModule } from '@angular/router/testing';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CustomMaterialModule } from './shared/custom-material.module';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatMenuModule,
        CustomMaterialModule,
        BrowserAnimationsModule,
        SharedModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader,
          },
        }),
      ],
      declarations: [AppComponent],
      providers: [TranslateService, TranslateStore],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'clean-angular'`, () => {
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('ledge');
  });

  it('should call window.open when click link', () => {
    spyOn(window, 'open');

    component.openLink('https://devops.phdoal.com');

    expect(window.open).toHaveBeenCalled();
  });

  it('should enable set language', () => {
    component.setLanguage('zh-cn');

    expect(component.translate.currentLang).toEqual('zh-cn');
  });
});
