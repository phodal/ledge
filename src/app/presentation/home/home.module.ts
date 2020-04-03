import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { PeriodicTableComponent } from '../../features/periodic-table/periodic-table.component';
import { AtomComponent } from '../../features/atom/atom.component';
import { AtomDetailsComponent } from '../../features/atom-details/atom-details.component';
import { AtomDialogComponent } from '../../features/atom-dialog/atom-dialog.component';
import { AppPhaseComponent } from '../../features/app-phase/app-phase.component';
import { AppWikiComponent } from '../../features/app-wiki/app-wiki.component';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { CustomMaterialModule } from '../../shared/custom-material.module';

@NgModule({
  declarations: [
    HomeComponent,
    PeriodicTableComponent,
    AtomComponent,
    AtomDetailsComponent,
    AtomDialogComponent,
    AppPhaseComponent,
    AppWikiComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    CustomMaterialModule,
    RouterModule.forChild([{ path: '', component: HomeComponent }]),
  ],
})
export class HomeModule {}
