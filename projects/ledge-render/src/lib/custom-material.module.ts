import { NgModule } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';

const modules = [
  MatSliderModule,
];

@NgModule({
  imports: modules,
  exports: modules,
})
export class CustomMaterialModule {}
