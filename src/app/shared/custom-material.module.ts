import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatDialogModule,
} from '@angular/material/dialog';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

const modules = [
  MatToolbarModule,
  MatButtonModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatSliderModule,
  MatSidenavModule,
  MatIconModule,
  MatDialogModule,
  MatCardModule,
  MatInputModule,
  MatTooltipModule,
  MatTabsModule,

  ScrollingModule,
];

@NgModule({
  imports: modules,
  declarations: [],
  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true } },
  ],
  exports: modules,
  entryComponents: [],
})
export class CustomMaterialModule {}
