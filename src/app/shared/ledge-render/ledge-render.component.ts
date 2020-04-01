import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import marked from 'marked/lib/marked';
import { LedgeChartModel } from '../components/model/ledge-chart.model';
import { Tokens, TokensList } from 'marked';
import LedgeMarkdownConverter from '../components/model/ledge-markdown-converter';

@Component({
  selector: 'ledge-render',
  templateUrl: './ledge-render.component.html',
  styleUrls: ['./ledge-render.component.scss']
})
export class LedgeRenderComponent implements OnInit, AfterViewInit, OnChanges {
  @Input()
  content: string;

  charts: LedgeChartModel[] = [];
  markdownData: any[] = [];

  constructor() {
  }

  ngOnInit(): void {
    this.renderContent(this.content);
  }

  ngAfterViewInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    const {content} = changes;
    this.content = content.currentValue;
    this.renderContent(this.content);
  }

  private renderContent(content: string) {
    this.markdownData = [];
    const tokens = marked.lexer(content);
    this.buildData(tokens);
  }

  private buildData(tokens: TokensList) {
    for (const token of tokens) {
      switch (token.type) {
        case 'table':
          this.markdownData.push(token);
          break;
        case 'code':
          this.handleCode(token);
          break;
        case 'paragraph':
          this.handleParaGraph(token, tokens);
          break;
        case 'space':
          break;
        default:
          this.markdownData.push(token);
          break;
      }
    }
  }

  private handleParaGraph(token: marked.Tokens.Paragraph, tokens: TokensList) {
    const inline = marked.inlineLexer(token.text, tokens.links);
    this.markdownData.push({
      type: 'paragraph',
      data: inline
    });
  }

  private handleCode(token: marked.Tokens.Code) {
    const codeBlock = token as Tokens.Code;
    switch (codeBlock.lang) {
      case 'chart':
        const chartData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({type: 'chart', data: chartData.tables[0]});
        break;
      case 'process-step':
        const stepData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({type: 'process-step', data: stepData.lists[0]});
        break;
      case 'process-table':
        const tableData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({type: 'process-table', data: tableData.tables[0]});
        break;
      case 'mindmap':
        const mindmapData = LedgeMarkdownConverter.toJson(codeBlock.text);
        this.markdownData.push({type: 'mindmap', data: mindmapData.lists[0]});
        break;
      default:
        this.markdownData.push(token);
        break;
    }
  }

  stringify(str: any) {
    return JSON.stringify(str);
  }
}
