import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSliderModule} from '@angular/material/slider';
import {MatDrawer, MatSidenavModule} from '@angular/material/sidenav';

const modules = [
  MatToolbarModule,
  MatButtonModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatSliderModule,
  MatSidenavModule
];

@NgModule({
  imports: modules,
  declarations: [],
  providers: [
  ],
  exports: modules,
  entryComponents: []
})
export class CustomMaterialModule {
}
