import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodicTableComponent } from './periodic-table/periodic-table.component';
import { AtomComponent } from './atom/atom.component';
import { AtomDetailsComponent } from './atom-details/atom-details.component';
import { AtomDialogComponent } from './atom-dialog/atom-dialog.component';
import { AppPhaseComponent } from './app-phase/app-phase.component';
import { AppWikiComponent } from './app-wiki/app-wiki.component';
import { CustomMaterialModule } from '../../shared/custom-material.module';

@NgModule({
  declarations: [
    PeriodicTableComponent,
    AtomComponent,
    AtomDetailsComponent,
    AtomDialogComponent,
    AppPhaseComponent,
    AppWikiComponent,
  ],
  exports: [
    PeriodicTableComponent,
    AtomComponent,
    AtomDetailsComponent,
    AtomDialogComponent,
    AppPhaseComponent,
    AppWikiComponent,
  ],
  imports: [CommonModule, CustomMaterialModule],
})
export class PeriodicTableModule {}
