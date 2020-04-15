import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodicTableComponent } from './periodic-table/periodic-table.component';
import { AtomComponent } from './atom/atom.component';
import { AtomDetailsComponent } from './atom-details/atom-details.component';
import { AtomDialogComponent } from './atom-dialog/atom-dialog.component';
import { AtomCategoryComponent } from './atom-category/atom-category.component';
import { CustomMaterialModule } from '../../shared/custom-material.module';

@NgModule({
  declarations: [
    PeriodicTableComponent,
    AtomComponent,
    AtomDetailsComponent,
    AtomDialogComponent,
    AtomCategoryComponent,
  ],
  exports: [
    PeriodicTableComponent,
    AtomComponent,
    AtomDetailsComponent,
    AtomDialogComponent,
    AtomCategoryComponent,
  ],
  imports: [CommonModule, CustomMaterialModule],
})
export class PeriodicTableModule {}
