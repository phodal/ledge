import {Component, Input, OnInit} from '@angular/core';
import {MarkdownService} from 'ngx-markdown';

@Component({
  selector: 'component-markdown-render',
  templateUrl: './markdown-render.component.html',
  styleUrls: ['./markdown-render.component.scss']
})
export class MarkdownRenderComponent implements OnInit {
  @Input()
  src: string;
  loading = true;

  // marked
  escapeTest = /[&<>"']/;
  escapeReplace = /[&<>"']/g;
  escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
  escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
  escapeReplacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;'
  };

  constructor(private markdownService: MarkdownService) {
  }

  ngOnInit(): void {
    const markedOptions: any = this.markdownService.options;
    this.markdownService.renderer.image = this.renderImage(markedOptions).bind(this);
    this.markdownService.renderer.code = this.renderCode(markedOptions).bind(this);
  }

  endLoading() {
    this.loading = false;
  }

  private renderImage(markedOptions: any) {
    return (href: string, title: string, text: string): string => {
      if (href === null) {
        return text;
      }
      let out = '<img src="' + href + '" alt="' + text + '"';
      if (title) {
        out += ' title="' + title + '"';
      }

      out += markedOptions.xhtml ? '/>' : '>';
      out += `<figcaption>${title}</figcaption>`;
      return `<figure>${out}</figure>`;
    };
  }

  private renderCode(options: any) {
    return (code: any, infoStr: any, escaped: any) => {
      const lang = (infoStr || '').match(/\S*/)[0];

      if (options.highlight) {
        const out = options.highlight(code, lang);
        if (out != null && out !== code) {
          escaped = true;
          code = out;
        }
      }

      if (!lang) {
        return '<pre><code>' + (escaped ? code : this.escape(code, true)) + '</code></pre>';
      }

      return `<pre>
    <code class="${options.langPrefix}${this.escape(lang, true)}">${escaped ? code : this.escape(code, true)}</code>
</pre>`;
    };
  }

  getEscapeReplacement(ch) {
    return this.escapeReplacements[ch];
  }

  escape(html: string, encode: boolean) {
    if (encode) {
      if (this.escapeTest.test(html)) {
        return html.replace(this.escapeReplace, this.getEscapeReplacement.bind(this));
      }
    } else {
      if (this.escapeTestNoEncode.test(html)) {
        return html.replace(this.escapeReplaceNoEncode, this.getEscapeReplacement.bind(this));
      }
    }

    return html;
  }

}
