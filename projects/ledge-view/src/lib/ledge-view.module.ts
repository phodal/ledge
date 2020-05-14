import { NgModule } from '@angular/core';
import { LedgeMarkdownRenderComponent } from './ledge-markdown-render/ledge-markdown-render.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LedgeRenderModule } from '@ledge-framework/render';
import { CustomMaterialModule } from './custom-material.module';
import { LedgeMultipleDocsComponent } from './ledge-multiple-docs/ledge-multiple-docs.component';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [LedgeMarkdownRenderComponent, LedgeMultipleDocsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    VirtualScrollerModule,
    RouterModule,
    LedgeRenderModule
  ],
  exports: [LedgeMarkdownRenderComponent, LedgeMultipleDocsComponent]
})
export class LedgeViewModule { }
