import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { PeriodicTableComponent } from '../../features/periodic-table/periodic-table/periodic-table.component';
import { AtomComponent } from '../../features/periodic-table/atom/atom.component';
import { AtomDetailsComponent } from '../../features/periodic-table/atom-details/atom-details.component';
import { AtomDialogComponent } from '../../features/periodic-table/atom-dialog/atom-dialog.component';
import { AppPhaseComponent } from '../../features/periodic-table/app-phase/app-phase.component';
import { AppWikiComponent } from '../../features/periodic-table/app-wiki/app-wiki.component';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { CustomMaterialModule } from '../../shared/custom-material.module';
import { PeriodicTableModule } from '../../features/periodic-table/periodic-table.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    SharedModule,
    PeriodicTableModule,
    CustomMaterialModule,
    RouterModule.forChild([{ path: '', component: HomeComponent }]),
  ],
})
export class HomeModule {}
