import { NgModule } from '@angular/core';
import { LedgeMarkdownRenderComponent } from './ledge-markdown-render/ledge-markdown-render.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LedgeRenderModule } from '@ledge-framework/render';
import { CustomMaterialModule } from './custom-material.module';


@NgModule({
  declarations: [LedgeMarkdownRenderComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    VirtualScrollerModule,
    BrowserAnimationsModule,
    LedgeRenderModule
  ],
  exports: [LedgeMarkdownRenderComponent]
})
export class LedgeViewModule { }
