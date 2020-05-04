import { NgModule } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

const modules = [
  MatSliderModule,
  MatInputModule,
  MatListModule,
  MatCheckboxModule,
  MatFormFieldModule,

  // CDK
  DragDropModule,
];

@NgModule({
  imports: modules,
  exports: modules,
})
export class CustomMaterialModule {}
