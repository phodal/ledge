import { NgModule } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { DragDropModule } from '@angular/cdk/drag-drop';

const modules = [
  MatSliderModule,
  DragDropModule,
];

@NgModule({
  imports: modules,
  exports: modules,
})
export class CustomMaterialModule {}
