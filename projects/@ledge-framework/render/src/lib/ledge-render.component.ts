import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Token, Tokens, TokensList } from 'marked';
import marked, { Slugger } from 'marked/lib/marked';
import LedgeMarkdownConverter from './components/model/ledge-markdown-converter';
import LedgeColors from './support/ledgeColors';
import { IPageInfo, VirtualScrollerComponent } from 'ngx-virtual-scroller';
import Prism from 'prismjs';

@Component({
  selector: 'ledge-render',
  templateUrl: './ledge-render.component.html',
  styleUrls: ['./ledge-render.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LedgeRenderComponent implements OnInit, OnChanges {
  @Input()
  content: string;
  @Input()
  virtualScroll: false;

  @Input()
  scrollToItem = 0;

  @Output()
  headingChange = new EventEmitter<any>();

  @ViewChild(VirtualScrollerComponent)
  private virtualScroller: VirtualScrollerComponent;

  markdownData: any[] = [];
  token = null;
  tokens: TokensList | any = [];
  listQueue = [];
  slugger = new Slugger();
  colorsForIndex = LedgeColors;

  isPureParagraph = true;

  lastHeading = 0;
  headingIndex = 0;
  headingMap = {};
  indexHeadingMap = {};
  scrolling = false;

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const {content, scrollToItem} = changes;
    if (content) {
      this.content = content.currentValue;
      this.renderContent(this.content);
    }

    if (scrollToItem) {
      this.scrolling = true;
      this.scrollToItem = scrollToItem.currentValue;
      if (!this.virtualScroller) {
        return;
      }
      this.virtualScroller.scrollToIndex(this.headingMap[this.scrollToItem], true, 0, 0, () => {
        this.scrolling = false;
      });
    }
  }

  private renderContent(content: string) {
    this.headingIndex = 0;
    this.headingMap = {};
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
        this.markdownData.push({type: 'blockquote', text: body});
        break;
      case 'paragraph':
        return this.handleParaGraph(token);
      case 'text':
        return this.renderInline(token.text, this.tokens.links);
      case 'heading':
        const inline = this.renderInline(token.text, this.tokens.links);
        this.markdownData.push({
          type: 'heading',
          depth: token.depth,
          text: inline,
          headingIndex: this.headingIndex,
          anchor: this.slugger.slug(this.unescape(inline)),
        });
        this.headingMap[this.headingIndex] = this.markdownData.length - 1;
        this.indexHeadingMap[this.markdownData.length - 1] = this.headingIndex;
        this.headingIndex++;
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
          this.markdownData.push({type: 'list', data: listBody, ordered});
        }

        return {children: listBody, ordered, start};
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
            itemBody.name += this.renderInline(this.parseText(), this.tokens.links);
          } else {
            const tok = this.tok();
            if (tok && tok.children) {
              itemBody.children = tok.children;
            } else {
              itemBody.name += tok;
            }
          }
        }

        return {body: itemBody, task, checked};
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
    const inline = this.renderInline(token.text, this.tokens.links);
    if (this.isPureParagraph) {
      this.markdownData.push({
        type: 'paragraph',
        data: inline,
      });
    }

    return inline;
  }

  private renderInline(tokenText: string, links: any) {
    const renderer = new marked.Renderer();
    const linkRenderer = renderer.link;
    renderer.link = (href, title, text) => {
      const html = linkRenderer.call(renderer, href, title, text);
      return html.replace(/^<a /, '<a target="_blank" ');
    };

    return marked.inlineLexer(tokenText, links, { renderer });
  }

  private handleCode(token: marked.Tokens.Code) {
    const codeBlock = token as Tokens.Code;
    switch (codeBlock.lang) {
      case 'toolset':
        const json = LedgeMarkdownConverter.toJson(codeBlock.text);
        if (json.config === undefined) {
          return;
        }
        const toolType = json.config.type;
        this.markdownData.push({
          type: 'toolset',
          data: {type: toolType, data: this.getDataByType(json, toolType)},
        });
        break;

      case 'mermaid':
      case 'graphviz':
      case 'echarts':
        this.markdownData.push({type: codeBlock.lang, data: codeBlock.text});
        break;

      case 'chart':
      case 'process-table':
      case 'process-card':
      case 'table-step':
      case 'heatmap':
        const tableData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({
          type: codeBlock.lang,
          data: tableData.tables[0],
          config: tableData.config,
        });
        break;

      case 'process-step':
      case 'mindmap':
      case 'pyramid':
      case 'radar':
      case 'quadrant':
      case 'list-style':
      case 'step-line':
      case 'pie':
      case 'dev-process':
      case 'tech-radar':
      case 'pipeline':
      case 'kanban':
      case 'checklist':
      case 'sunburst':
      case 'fishbone':
      case 'maturity':
      case 'tree':
        const {config, lists} = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({
          type: codeBlock.lang,
          data: lists[0].children,
          config,
        });
        break;
      default:
        if (Prism.languages[token.lang]) {
          token.text = Prism.highlight(token.text, Prism.languages[token.lang], token.lang);
        }
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

  vsChange($event: IPageInfo) {
    if (this.indexHeadingMap[$event.startIndex]) {
      this.headingChange.emit(this.markdownData[$event.startIndex]);
    }
  }
}
