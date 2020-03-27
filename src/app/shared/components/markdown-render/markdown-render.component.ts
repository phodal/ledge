import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener, Inject,
  Input,
  OnChanges,
  OnInit, Renderer2,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { DOCUMENT, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MarkdownService } from 'ngx-markdown';
import marked, { Slugger } from 'marked';
import { maxBy, zip } from 'lodash-es';
import * as echarts from 'echarts';
import ECharts = echarts.ECharts;

import * as d3 from 'd3';
import * as dagreD3 from 'dagre-d3';
import * as graphlibDot from 'graphlib-dot';
import * as mermaid from 'mermaid';

import ChartOptions from '../../support/chart-options';
import MarkdownHelper from '../model/markdown.helper';
import Tocify, { TocItem } from './tocify';

@Component({
  selector: 'component-markdown-render',
  templateUrl: './markdown-render.component.html',
  styleUrls: ['./markdown-render.component.scss']
})
export class MarkdownRenderComponent implements OnInit, OnChanges, AfterViewInit {
  @Input()
  src: string;

  @Input()
  showToc = false;
  @Input()
  showScroll = true;

  @Input()
  data = '';

  @ViewChild('toc', {static: false}) tocEl: ElementRef;
  @ViewChild('drawerContent', {static: false}) drawerEl: any;

  loading = this.data !== '';

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
  private chartIndex = 0;
  private chartInstances: ECharts[] = [];
  private toc = [];
  tocStr = '';
  sticky = false;
  windowScrolled = false;
  private graphvizData = [];
  private graphvizIndex = 0;
  private mermaidIndex = 0;
  private mermaidData = [];

  private echartsIndex = 0;
  private echartsData = [];

  private webComponentsIndex = 0;
  private webComponentsData = [];

  private toolsetId = 0;
  toolsets: ToolsetOption[] = [];

  constructor(private markdownService: MarkdownService,
              private tocify: Tocify,
              private location: Location,
              private route: ActivatedRoute,
              private renderer2: Renderer2,
              @Inject(DOCUMENT) private document: Document,
              private myElement: ElementRef) {
  }

  ngOnInit(): void {
    const markedOptions: any = this.markdownService.options;
    this.markdownService.renderer.image = this.renderImage(markedOptions).bind(this);
    this.markdownService.renderer.code = this.renderCode(markedOptions).bind(this);
    this.markdownService.renderer.heading = this.renderHeading(markedOptions).bind(this);
  }

  ngAfterViewInit(): void {
    if (this.data !== '') {
      this.endLoading();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.src) {
      this.mindmapIndex = 0;
      this.chartIndex = 0;
      this.webComponentsIndex = 0;
      this.mermaidIndex = 0;
      this.toolsetId = 0;

      this.chartInfos = [];
      this.mermaidData = [];
      this.graphvizData = [];
      this.webComponentsData = [];
      this.toolsets = [];
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    for (const chartInstance of this.chartInstances) {
      chartInstance.resize();
    }
  }

  @HostListener('window:scroll', ['$event'])
  handleScroll() {
    const windowScroll = window.pageYOffset;
    const headerHeight = 64;
    if (windowScroll >= headerHeight) {
      this.sticky = true;
    } else {
      this.sticky = false;
    }

    let top = 0;
    if (this.drawerEl) {
      top = this.drawerEl.elementRef.nativeElement.scrollTop;
    }

    if (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || top > 64) {
      this.windowScrolled = true;
    } else if (this.windowScrolled && window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || top < 10) {
      this.windowScrolled = false;
    }
  }

  scrollToTop() {
    window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
    if (this.drawerEl) {
      this.drawerEl.elementRef.nativeElement.scrollTop = 0;
    }
  }

  endLoading() {
    this.loading = false;
    for (const chartInstance of this.chartInstances) {
      chartInstance.clear();
    }

    const items = this.tocify.tocItems;
    this.tocStr = this.renderToc(items).join('');
    if (this.tocEl && this.tocEl.nativeElement) {
      this.tocEl.nativeElement.innerHTML = this.tocStr;
    }
    this.tocify.reset();

    setTimeout(() => {
      this.renderChart();
      this.renderGraphviz();
      this.renderMermaid();
      this.renderEcharts();
      this.loadWebComponents();
    }, 50);

    setTimeout(() => this.gotoHeading(), 500);
  }

  private gotoHeading() {
    this.route.fragment.subscribe((fragment: string) => {
      if (!!fragment) {
        const element = this.myElement.nativeElement.querySelector('#' + fragment);
        if (!!element) {
          element.scrollIntoView();
        }
      }
    });
  }

  private renderToc(items: TocItem[]) {
    return items.map(item => {
      const href = `${this.location.path()}#${item.anchor}`;
      const link = `<a class="level_${item.level}" id="menu-${item.anchor}" href="${href}" title=${item.text}>${item.text}</a>`;
      if (item.children) {
        const childrenItems = this.renderToc(item.children);
        return `<li>${link}<ul>${childrenItems.join('')}</ul></li>`;
      } else {
        return `<li>${link}</li>`;
      }
    });
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

  private renderHeading(options: any) {
    return (text: string, level: number, raw: string, slugger: Slugger) => {
      const anchor = slugger.slug(raw);
      this.tocify.add(text, level, '', anchor);
      if (options.headerIds) {
        return `<h${level} id="${options.headerPrefix}${anchor}">${text}</h${level}>
`;
      }
      return `<h${level}>${text}</h${level}>
`;
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
        case 'process-step':
          return this.buildTableStep(code);
        case 'mindmap':
          return this.buildMindmapData(code);
        case 'radar':
          return this.buildRadarChartData(code);
        case 'pyramid':
          return this.buildPyramidChartData(code);
        case 'quadrant':
          return this.buildQuadrantChartData(code);
        case 'class':
          return this.buildClassCode(code);
        case 'graphviz':
          return this.buildGraphvizData(code);
        case 'mermaid':
          return this.buildMermaidData(code);
        case 'echarts':
          return this.buildEchartsData(code);
        case 'webcomponents':
          return this.buildWebComponents(code);
        case 'toolset':
          return this.buildToolsets(code);
        default:
          return this.buildNormalCode(options, code, lang, escaped);
      }
    };
  }

  private buildClassCode(code: any) {
    return `<div class="${code}"></div>`;
  }

  private buildNormalCode(options: any, code: any, lang: string, escaped: any) {
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

  private buildMindmapData(code: any) {
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
    return `<div class="markdown-mindmap ${currentMap.id}"></div>`;
  }

  private renderChart() {
    if (this.chartInfos.length === 0) {
      return;
    }

    for (const chartInfo of this.chartInfos) {
      const elements = document.getElementsByClassName(chartInfo.id);
      if (elements.length < 1) {
        return;
      }
      const chartEl = elements[0];
      const mychart = echarts.init(chartEl as any);
      this.chartInstances.push(mychart);

      const newData = this.toTreeData(chartInfo.data);
      switch (chartInfo.type) {
        case 'mindmap':
          mychart.setOption(ChartOptions.buildMindmapOption(newData) as any);
          break;
        case 'radarchart':
          mychart.setOption(ChartOptions.buildRadarChartOption(newData));
          break;
        case 'quadrant':
          mychart.setOption(ChartOptions.buildQuadrantChartOption(newData));
          break;
        case 'pyramid':
          const pyramidLength = newData.children.length;
          const CHART_MAX_VALUE = 100;
          for (let i = 0; i < pyramidLength; i++) {
            newData.children[i].value = CHART_MAX_VALUE / pyramidLength * (i + 1);
          }

          mychart.setOption(ChartOptions.buildPyramidChartOption(newData) as any);
          break;
      }
    }
  }

  private toTreeData(data: any) {
    if (data.length === 1) {
      const childrenInfo = this.transformTreeData(data[0].childrens);
      return {
        name: data[0].item.text,
        children: childrenInfo,
        config: data.config
      };
    }

    const treeInfo = this.transformTreeData(data);
    return {
      name: '',
      children: treeInfo,
      config: data.config
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

  private buildRadarChartData(code: any) {
    const tokens = marked.lexer(code);
    let items = [];
    items = MarkdownHelper.markdownToJSON(tokens, items);
    const currentMap = {
      id: 'radarchart-' + this.chartIndex,
      type: 'radarchart',
      data: items
    };

    this.chartInfos.push(currentMap);

    this.chartIndex++;
    return `<div class="markdown-radarchart ${currentMap.id}"></div>`;
  }

  private buildGraphvizData(code: any) {
    this.graphvizIndex++;

    this.graphvizData.push({
      id: this.graphvizIndex,
      code
    });

    return `<div class="graphviz"><svg id="graphviz-${this.graphvizIndex}"></svg></div>`;
  }

  private renderGraphviz() {
    for (const graph of this.graphvizData) {
      const render = dagreD3.render();
      const g = graphlibDot.read(graph.code);

      d3.select('#graphviz-' + graph.id).call(render, g);
    }
  }

  private buildQuadrantChartData(code: any) {
    const tokens = marked.lexer(code);
    let items = [];
    items = MarkdownHelper.markdownToJSON(tokens, items);
    const currentMap = {
      id: 'quadrant-' + this.chartIndex,
      type: 'quadrant',
      data: items
    };

    this.chartInfos.push(currentMap);
    this.chartIndex++;
    return `<div class="markdown-quadrant ${currentMap.id}"></div>`;
  }

  private buildPyramidChartData(code: any) {
    const tokens = marked.lexer(code);
    let items = [];
    items = MarkdownHelper.markdownToJSON(tokens, items);
    const currentMap = {
      id: 'pyramid-' + this.chartIndex,
      type: 'pyramid',
      data: items
    };

    this.chartInfos.push(currentMap);
    this.chartIndex++;
    return `<div class="markdown-pyramid ${currentMap.id}"></div>`;
  }

  private buildTableStep(code: any) {
    const tokens = marked.lexer(code);
    let items = [];
    items = MarkdownHelper.markdownToJSON(tokens, items);

    const maxItem = maxBy(items, (d) => d.childrens.length);
    const maxLength = maxItem.childrens.length;

    let maxWidthClass = '';
    const MAX_ONE_COLUMN = 10;
    if (maxLength > MAX_ONE_COLUMN) {
      maxWidthClass = 'process-step-max';
    }

    let cols = '';
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < items.length; i++) {
      let itemsStr = '';
      const title = items[i].item.text;
      for (let j = 0; j < maxLength; j++) {
        let text = '';
        if (items[i].childrens[j]) {
          text = items[i].childrens[j].item.text;
        }
        if (text !== '') {
          itemsStr += `<div class="process-step-item ${maxWidthClass}">${text}</div>`;
        }
      }

      cols += `<div class="process-step-column">
  <div class="process-title">${title}</div><div class="process-body ${maxWidthClass === '' ? '' : 'process-long-body'}">${itemsStr}</div>
</div>`;
    }

    return `<div class="markdown-process-step">${cols}</div>`;
  }

  private buildMermaidData(code: any) {
    this.mermaidIndex++;

    this.mermaidData.push({
      id: this.mermaidIndex,
      code
    });

    return `<div class="mermaid-graph" id="mermaid-${this.mermaidIndex}"></div>`;
  }

  private renderMermaid() {
    for (const graph of this.mermaidData) {
      mermaid.initialize({
        theme: 'default',
        gantt: {
          titleTopMargin: 25,
          barHeight: 48,
          barGap: 4,
          topPadding: 50,
          leftPadding: 75,
          gridLineStartPadding: 35,
          fontSize: 18,
          fontFamily: '"Open-Sans", "sans-serif"',
          numberSectionStyles: 4,
          axisFormat: '%Y-%m-%d',
        }
      });

      const element: any = document.getElementById('mermaid-' + graph.id);
      if (element == null) {
        return;
      }
      const graphDefinition = graph.code;
      mermaid.render(`graphDiv${graph.id}`, graphDefinition, (svgCode, bindFunctions) => {
        element.innerHTML = svgCode;
      });
    }
  }

  private buildEchartsData(code: any) {
    this.echartsIndex++;

    const chartId = 'echarts-' + this.echartsIndex;
    this.echartsData.push({
      id: chartId,
      data: code
    });

    return `<div class="normal-echarts" id="${chartId}"></div>`;
  }

  private renderEcharts() {
    for (const chartInfo of this.echartsData) {
      const chartEl = document.getElementById(chartInfo.id);
      const mychart = echarts.init(chartEl as any);
      this.chartInstances.push(mychart);
      mychart.setOption(JSON.parse(chartInfo.data));
    }
  }

  private buildWebComponents(code: any) {
    this.webComponentsIndex++;

    // todo: add security check
    const id = 'webcomponents-' + this.webComponentsIndex;
    const data = JSON.parse(code);
    this.webComponentsData.push({
      id,
      data
    });

    return `<div class="webcomponents-plugins"><${data.name} id="${id}"></${data.name}></div>`;
  }

  private loadWebComponents() {
    for (const wc of this.webComponentsData) {
      const data = wc.data;
      const script = this.renderer2.createElement('script');
      script.src = data.src;
      this.renderer2.appendChild(this.document.body, script);
    }
  }

  private buildToolsets(code: any) {
    this.toolsetId++;

    const id = 'toolset-' + this.webComponentsIndex;
    const tokens = marked.lexer(code);
    let items: any;
    items = MarkdownHelper.markdownToJSON(tokens, items);

    this.toolsets.push({
      id,
      data: items,
      type: items.config.type
    });

    return `<div class="toolset-placeholder" id="${id}"></div>`;
  }
}
