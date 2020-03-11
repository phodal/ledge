import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MarkdownRenderComponent } from './components/markdown-render/markdown-render.component';
import { MarkdownModule } from 'ngx-markdown';
import { CustomMaterialModule } from './custom-material.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    MarkdownModule.forRoot({ loader: HttpClient })
  ],
  declarations: [
    MarkdownRenderComponent,
  ],
  providers: [
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MarkdownRenderComponent
  ],
  entryComponents: []
})
export class SharedModule {
}
