import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LedgeRenderModule } from '@ledge-framework/render';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSplitModule } from 'angular-split';
import { AceEditorModule } from 'ngx-ace-tern';

import { CustomMaterialModule } from '../../shared/custom-material.module';
import { SharedModule } from '../../shared/shared.module';
import { LedgeEditorComponent } from './ledge-editor.component';

@NgModule({
  declarations: [LedgeEditorComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    LedgeRenderModule,
    CustomMaterialModule,
    AceEditorModule,
    TranslateModule.forChild({
      isolate: false,
    }),
    AngularSplitModule.forRoot(),
    RouterModule.forChild([{ path: '', component: LedgeEditorComponent }]),
  ],
})
export class LedgeEditorModule {}
