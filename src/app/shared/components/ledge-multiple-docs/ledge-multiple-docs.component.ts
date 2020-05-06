import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatDrawerContent } from '@angular/material/sidenav';
import { Title } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { DocRoute } from './doc-route.model';

@Component({
  selector: 'ledge-multiple-docs',
  templateUrl: './ledge-multiple-docs.component.html',
  styleUrls: ['./ledge-multiple-docs.component.scss'],
})
export class LedgeMultipleDocsComponent implements OnInit, OnChanges {
  @ViewChild('drawerContent', { static: false })
  drawerContent: MatDrawerContent;

  srcUrl: string;
  content: string;

  @Input() items: DocRoute[];
  @Input() currentUrl: string;
  @Input() urlPrefix: string;
  @Input() source: string;

  constructor(private title: Title, private http: HttpClient) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.source) {
      this.source = changes.source.currentValue;
      this.configSource(this.source);
    }
  }

  private configSource(value: string) {
    this.getItem(value);
  }

  async getItem(source: string) {
    this.srcUrl = this.buildSrc(source);
    this.source = source;

    const headers = new HttpHeaders().set(
      'Content-Type',
      'text/plain; charset=utf-8'
    );
    this.http
      .get(this.srcUrl, { headers, responseType: 'text' })
      .subscribe((response) => {
        this.resetScrollbar();
        this.content = response;
      });
  }

  private resetScrollbar() {
    if (!!this.drawerContent) {
      if (!this.drawerContent.hasOwnProperty('nativeElement')) {
        this.drawerContent.getElementRef().nativeElement.scrollTop = 0;
      }
    }
  }

  private buildSrc(source: string) {
    return `assets/docs/${this.urlPrefix}/${source}.md`;
  }
}
