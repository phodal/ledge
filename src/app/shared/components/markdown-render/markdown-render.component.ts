import { Component, Input, OnInit } from '@angular/core';
import { MarkdownService } from 'ngx-markdown';

@Component({
  selector: 'component-markdown-render',
  templateUrl: './markdown-render.component.html',
  styleUrls: ['./markdown-render.component.scss']
})
export class MarkdownRenderComponent implements OnInit {
  @Input()
  src: string;

  constructor(private markdownService: MarkdownService) { }

  ngOnInit(): void {
    // this.markdownService.renderer.table = (header: string, body: string) => {
    //   return '';
    // };
  }
}
