import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { SelectionBarComponent } from './features/selection-bar/selection-bar.component';
import { PeriodicTableComponent } from './features/periodic-table/periodic-table.component';
import { AtomComponent } from './features/atom/atom.component';
import { AtomDetailsComponent } from './features/atom-details/atom-details.component';
import { FooterComponent } from './features/footer/footer.component';
import { AppPhaseComponent } from './features/app-phase/app-phase.component';
import { AppWikiComponent } from './features/app-wiki/app-wiki.component';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './presentation/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomMaterialModule } from './shared/custom-material.module';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,

    SelectionBarComponent,
    PeriodicTableComponent,
    AtomComponent,
    AtomDetailsComponent,
    FooterComponent,
    AppPhaseComponent,
    AppWikiComponent,
  ],
  imports: [
    SharedModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CustomMaterialModule,
  ],
  providers: [Title],
  bootstrap: [AppComponent]
})
export class AppModule { }
