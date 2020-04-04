import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LedgeRenderModule } from '@ledge-framework/render';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AwesomeToolComponent } from './presentation/awesome-tool/awesome-tool.component';
import { CaseStudyComponent } from './presentation/case-study/case-study.component';
import { ManualComponent } from './presentation/manual/manual.component';
import { MaturityItemComponent } from './presentation/maturity/maturity-item/maturity-item.component';
import { MaturityComponent } from './presentation/maturity/maturity.component';
import { MobileComponent } from './presentation/mobile/mobile.component';
import { PatternComponent } from './presentation/pattern/pattern.component';
import { PractiseComponent } from './presentation/practise/practise.component';
import { ReporterComponent } from './presentation/reporter/reporter.component';
import { ResourcesComponent } from './presentation/resources/resources.component';
import { SolutionComponent } from './presentation/solution/solution.component';
import { ThinkTankComponent } from './presentation/think-tank/think-tank.component';
import { CustomMaterialModule } from './shared/custom-material.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,

    CaseStudyComponent,
    PatternComponent,
    PractiseComponent,
    ManualComponent,
    ResourcesComponent,
    ReporterComponent,
    AwesomeToolComponent,
    MobileComponent,
    ThinkTankComponent,
    SolutionComponent,

    MaturityComponent,
    MaturityItemComponent,
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
  ],
  providers: [Title],
  bootstrap: [AppComponent],
})
export class AppModule {}
