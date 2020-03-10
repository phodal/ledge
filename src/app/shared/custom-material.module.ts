import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

const modules = [
  MatToolbarModule,
  MatButtonModule,
  MatMenuModule
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
