import {Component, Input, OnInit} from '@angular/core';
import {MarkdownService} from 'ngx-markdown';
import marked from 'marked';
import {zip} from 'lodash-es';
import MarkdownHelper from '../model/markdown.helper';
import * as echarts from 'echarts';
import ChartOptions from './chart-options';

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
  private mindmapIndex = 0;
  private chartInfos = [];
  private radarChartIndex = 0;

  constructor(private markdownService: MarkdownService) {
  }

  ngOnInit(): void {
    const markedOptions: any = this.markdownService.options;
    this.markdownService.renderer.image = this.renderImage(markedOptions).bind(this);
    this.markdownService.renderer.code = this.renderCode(markedOptions).bind(this);
  }

  endLoading() {
    this.loading = false;
    setTimeout(() => this.renderChat(), 100);
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

      switch (lang) {
        case 'process':
          return this.buildCodeProcess(code);
        case 'process-table':
          return this.buildTableProcess(code);
        case 'mindmap':
          return this.buildMindmap(code);
        case 'radar':
          return this.buildRadarChart(code);
        default:
          return this.renderNormalCode(options, code, lang, escaped);
      }
    };
  }

  private renderNormalCode(options: any, code: any, lang: string, escaped: any) {
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

  private buildCodeProcess(code: string) {
    const splitCode = code.split(' -> ');
    let items = '';

    // tslint:disable-next-line:prefer-for-of
    const length = splitCode.length;
    for (let index = 0; index < length; index++) {
      let str = splitCode[index];
      str = str.substr(1, str.length - 2);
      items += this.buildProcessHeaderItem(index, str);
    }

    return `<div class="process-table markdown-table">` + this.buildProcessHeader(items) + `</div>`;
  }

  private buildProcessHeaderItem(index: number, str: string) {
    return `
      <div class="flex-row cell type_${index}">
        ${str}
      </div>
      `;
  }

  private buildProcessHeader(items: string) {
    return `<div class="table-container" role="table" aria-label="Destinations">
    <div class="flex-table header" role="rowgroup">
      ${items}
    </div>
    </div>`;
  }

  private buildTableProcess(code: any) {
    let resultStr = '';
    let headers = [];
    let cells = [];

    const tokens = marked.lexer(code);
    for (const token of tokens) {
      if (token.type === 'table') {
        headers = token.header;
        cells = this.transpose(token.cells);
      }
    }
    resultStr += this.buildProcessHeader(this.buildHeaderItem(headers));
    const bodyResult = this.buildTableBody(cells);

    resultStr += `<div class="table-space"></div><div class="flex-table row">${bodyResult}</div>`;

    return `<div class="process-table markdown-table">` + resultStr + '</div>';
  }

  private buildTableBody(cells: any[]) {
    let bodyResult = '';
    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < cells.length; index++) {
      const column = cells[index];
      let columnStr = '';
      // tslint:disable-next-line:prefer-for-of
      for (let j = 0; j < column.length; j++) {
        columnStr += `<div class="cell">${column[j]}</div>`;
      }

      bodyResult += `<div class="table-column">${columnStr}</div>`;
    }
    return bodyResult;
  }

  private buildHeaderItem(headers: any[]) {
    let headerStr = '';
    for (let index = 0; index < headers.length; index++) {
      const header = headers[index];
      headerStr += this.buildProcessHeaderItem(index, header);
    }

    return headerStr;
  }

  transpose(arr: any[][]) {
    return zip.apply(this, arr);
  }

  private buildMindmap(code: any) {
    const tokens = marked.lexer(code);
    let items = [];
    items = MarkdownHelper.markdownToJSON(tokens, items);
    const currentMap = {
      id: 'mindmap-' + this.mindmapIndex,
      type: 'mindmap',
      data: items
    };

    this.chartInfos.push(currentMap);
    this.mindmapIndex++;
    return `<div class="markdown-mindmap ${currentMap.id}">mindmap</div>`;
  }

  private renderChat() {
    if (this.chartInfos.length === 0) {
      return;
    }

    for (const chartInfo of this.chartInfos) {
      const chartEl = document.getElementsByClassName(chartInfo.id)[0];
      const mychart = echarts.init(chartEl);
      if (chartInfo.type === 'mindmap') {
        const newData = this.toTreeData(chartInfo.data);
        mychart.setOption(ChartOptions.buildTreeOption(newData));
      } else if (chartInfo.type === 'radarchart') {
        const newData = this.toTreeData(chartInfo.data);
        console.log(newData)
        mychart.setOption(ChartOptions.buildRadarChartOption(newData));
      }
    }
  }

  private toTreeData(data: any) {
    if (data.length === 1) {
      // tslint:disable-next-line:no-shadowed-variable
      const childrenInfo = this.transformTreeData(data[0].childrens);
      return {
        name: data[0].item.text,
        children: childrenInfo
      };
    }

    const treeInfo = this.transformTreeData(data);
    return {
      name: '',
      children: treeInfo
    };
  }

  private transformTreeData(data: any) {
    const nodes = [];
    for (const item of data) {
      const node: any = {};
      node.name = item.item.text;
      if (item.childrens && item.childrens.length > 0) {
        node.children = this.transformTreeData(item.childrens);
      }
      nodes.push(node);
    }
    return nodes;
  }

  private buildRadarChart(code: any) {
    const tokens = marked.lexer(code);
    let items = [];
    items = MarkdownHelper.markdownToJSON(tokens, items);
    const currentMap = {
      id: 'radarchart-' + this.radarChartIndex,
      type: 'radarchart',
      data: items
    };

    this.chartInfos.push(currentMap);

    this.radarChartIndex++;
    return `<div class="markdown-radarchart ${currentMap.id}">radarchart</div>`;
  }
}
