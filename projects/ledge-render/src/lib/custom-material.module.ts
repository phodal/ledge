import { NgModule } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';

const modules = [
  MatSliderModule,
  DragDropModule,
  MatListModule,
  MatCheckboxModule,
  MatFormFieldModule
];

@NgModule({
  imports: modules,
  exports: modules,
})
export class CustomMaterialModule {}
