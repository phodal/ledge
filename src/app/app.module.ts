import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LedgeRenderModule } from '@ledge-framework/render';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToolsetComponent } from './presentation/toolset/toolset.component';
import { ManualComponent } from './presentation/manual/manual.component';
import { MaturityItemComponent } from './presentation/maturity/maturity-item/maturity-item.component';
import { MaturityComponent } from './presentation/maturity/maturity.component';
import { PatternComponent } from './presentation/pattern/pattern.component';
import { ReporterComponent } from './presentation/reporter/reporter.component';
import { ResourcesComponent } from './presentation/resources/resources.component';
import { CustomMaterialModule } from './shared/custom-material.module';
import { SharedModule } from './shared/shared.module';
import { ScullyLibModule } from '@scullyio/ng-lib';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LedgeMultipleDocsComponent } from './features/ledge-multiple-docs/ledge-multiple-docs.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    PatternComponent,
    ManualComponent,
    ResourcesComponent,
    ReporterComponent,
    ToolsetComponent,

    MaturityComponent,
    MaturityItemComponent,
    LedgeMultipleDocsComponent,
  ],
  imports: [
    SharedModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    CustomMaterialModule,
    LedgeRenderModule,
    ScullyLibModule,
    FlexLayoutModule,
    TranslateModule.forRoot({
      defaultLanguage: 'zh-cn',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [Title],
  bootstrap: [AppComponent],
})
export class AppModule {}
