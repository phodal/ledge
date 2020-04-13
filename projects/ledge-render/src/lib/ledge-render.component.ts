import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Token, Tokens, TokensList } from 'marked';
import marked, { Slugger } from 'marked/lib/marked';
import LedgeMarkdownConverter from './components/model/ledge-markdown-converter';
import LedgeColors from './support/ledgeColors';

@Component({
  selector: 'ledge-render',
  templateUrl: './ledge-render.component.html',
  styleUrls: ['./ledge-render.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LedgeRenderComponent implements OnInit, OnChanges {
  constructor() { }

  @Input()
  content: string;
  @Input()
  virtualScroll: false;

  markdownData: any[] = [];
  token = null;
  tokens: TokensList | any = [];
  listQueue = [];
  slugger = new Slugger();
  colorsForIndex = LedgeColors;

  isPureParagraph = true;

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    const { content } = changes;
    this.content = content.currentValue;
    this.renderContent(this.content);
  }

  private renderContent(content: string) {
    this.markdownData = [];
    const tokens = marked.lexer(content);
    this.tokens = tokens.reverse();

    while (this.next()) {
      this.tok();
    }
  }

  private next(): Token {
    this.token = this.tokens.pop();
    return this.token;
  }

  private peek() {
    return this.tokens[this.tokens.length - 1] || 0;
  }

  private parseText() {
    let body = this.token.text;

    while (this.peek().type === 'text') {
      body += '\n' + (this.next() as any).text;
    }

    return body;
  }

  private unescape(html) {
    const unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi;
    return html.replace(unescapeTest, (_, n) => {
      n = n.toLowerCase();
      if (n === 'colon') {
        return ':';
      }
      if (n.charAt(0) === '#') {
        return n.charAt(1) === 'x'
          ? String.fromCharCode(parseInt(n.substring(2), 16))
          : String.fromCharCode(+n.substring(1));
      }
      return '';
    });
  }

  private tok() {
    const token: Token = this.token;
    switch (token.type) {
      case 'table':
        this.markdownData.push(token);
        break;
      case 'code':
        this.handleCode(token);
        break;
      case 'space':
        return '';
      case 'blockquote_start':
        let body = '';
        this.isPureParagraph = false;
        while (this.next().type !== 'blockquote_end') {
          body += this.tok();
        }
        this.isPureParagraph = true;
        this.markdownData.push({ type: 'blockquote', text: body });
        break;
      case 'paragraph':
        return this.handleParaGraph(token);
      case 'text':
        return marked.inlineLexer(token.text, this.tokens.links);
      case 'heading':
        const inline = marked.inlineLexer(token.text, this.tokens.links);
        this.markdownData.push({
          type: 'heading',
          depth: token.depth,
          text: inline,
          anchor: this.slugger.slug(this.unescape(inline)),
        });
        break;
      case 'list_start': {
        const listBody = [];
        const ordered = this.token.ordered;
        const start = this.token.start;
        this.listQueue.push(1);

        while (this.next().type !== 'list_end') {
          listBody.push(this.tok());
        }

        this.listQueue.pop();
        if (this.listQueue.length === 0) {
          this.markdownData.push({ type: 'list', data: listBody, ordered });
        }

        return { children: listBody, ordered, start };
      }
      case 'list_item_start': {
        const itemBody = {
          name: '',
          children: [],
        };
        const loose = this.token.loose;
        const checked = this.token.checked;
        const task = this.token.task;

        while (this.next().type !== 'list_item_end') {
          if (!loose && this.token.type === 'text') {
            itemBody.name += marked.inlineLexer(
              this.parseText(),
              this.tokens.links
            );
          } else {
            const tok = this.tok();
            if (tok && tok.children) {
              itemBody.children = tok.children;
            } else {
              itemBody.name += tok;
            }
          }
        }

        return { body: itemBody, task, checked };
      }
      case 'hr':
        this.markdownData.push(token);
        break;
      case 'html':
        return token.text;
      default:
        this.markdownData.push(token);
        break;
    }
  }

  private handleParaGraph(token: marked.Tokens.Paragraph) {
    const inline = marked.inlineLexer(token.text, this.tokens.links);
    if (this.isPureParagraph) {
      this.markdownData.push({
        type: 'paragraph',
        data: inline,
      });
    }

    return inline;
  }

  private handleCode(token: marked.Tokens.Code) {
    const codeBlock = token as Tokens.Code;
    switch (codeBlock.lang) {
      case 'chart':
        const chartData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({ type: 'chart', data: chartData.tables[0] });
        break;
      case 'process-step':
        const stepData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({
          type: 'process-step',
          data: stepData.lists[0],
        });
        break;
      case 'process-table':
        const tableData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({
          type: 'process-table',
          data: tableData.tables[0],
        });
        break;
      case 'process-card':
        const cardData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({
          type: 'process-card',
          data: cardData.tables[0],
          config: cardData.config,
        });
        break;
      case 'mindmap':
        const mindmapData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({ type: 'mindmap', data: mindmapData.lists[0] });
        break;
      case 'pyramid':
        const pyramidData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({ type: 'pyramid', data: pyramidData.lists[0] });
        break;
      case 'radar':
        const radarData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({
          type: 'radar',
          data: radarData.lists[0],
          config: radarData.config,
        });
        break;
      case 'quadrant':
        const quadrantData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({
          type: 'quadrant',
          data: quadrantData.lists[0],
          config: quadrantData.config
        });
        break;
      case 'toolset':
        const json = LedgeMarkdownConverter.toJson(codeBlock.text);
        const toolType = json.config.type;
        this.markdownData.push({
          type: 'toolset',
          data: { type: toolType, data: this.getDataByType(json, toolType) },
        });
        break;
      case 'graphviz':
        this.markdownData.push({ type: 'graphviz', data: codeBlock.text });
        break;
      case 'echarts':
        this.markdownData.push({ type: 'echarts', data: codeBlock.text });
        break;
      case 'list-style':
        const listData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({
          type: 'list-style',
          data: listData.lists[0].children,
          config: listData.config,
        });
        break;
      case 'step-line':
        const stepLineData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({
          type: 'step-line',
          data: stepLineData.lists[0].children
        });
        break;
      case 'table-step':
        const tableStepData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({
          type: 'table-step',
          data: tableStepData.tables[0],
          config: tableStepData.config,
        });
        break;
      case 'pie':
        const pieData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({
          type: 'pie',
          data: pieData.lists[0].children,
          config: pieData.config,
        });
        break;
      case 'dev-process':
        const devProcessData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({
          type: 'dev-process',
          data: devProcessData.lists[0].children,
          config: devProcessData.config,
        });
        break;
      default:
        this.markdownData.push(token);
        break;
    }
  }

  private getDataByType(
    json: { tables: any[]; lists: any[]; config: any },
    type: any
  ) {
    switch (type) {
      case 'slider':
        return json.lists[0].children;
      case 'line-chart':
        return json.tables[0];
      default:
        return json;
    }
  }

  stringify(str: any) {
    return JSON.stringify(str);
  }
}
