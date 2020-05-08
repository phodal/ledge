import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule, SecurityContext } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LedgeRenderModule } from '@ledge-framework/render';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';

import { CustomMaterialModule } from './custom-material.module';
import { LedgeMarkdownRenderComponent } from './components/ledge-markdown-render/ledge-markdown-render.component';
import { LedgeMultipleDocsComponent } from './components/ledge-multiple-docs/ledge-multiple-docs.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CustomMaterialModule,
    LedgeRenderModule,
    TranslateModule,
    MarkdownModule.forRoot({
      sanitize: SecurityContext.NONE,
      loader: HttpClient,
      markedOptions: {
        provide: MarkedOptions,
        useValue: {
          gfm: true,
          breaks: false,
          pedantic: false,
          smartLists: true,
          smartypants: false,
          langPrefix: 'language-',
          headerPrefix: '',
          headerIds: true,
        },
      },
    }),
  ],
  declarations: [LedgeMarkdownRenderComponent, LedgeMultipleDocsComponent],
  providers: [],
  exports: [LedgeMarkdownRenderComponent, LedgeMultipleDocsComponent],
  entryComponents: [],
})
export class SharedModule {}
