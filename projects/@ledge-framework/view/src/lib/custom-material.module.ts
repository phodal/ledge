import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';

const modules = [
  MatSidenavModule,
  MatIconModule
];

@NgModule({
  imports: modules,
  exports: modules,
})
export class CustomMaterialModule {}
