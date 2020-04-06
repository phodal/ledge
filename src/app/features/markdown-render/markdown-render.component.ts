import { DOCUMENT, Location } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Slugger } from 'marked/lib/marked';
import { MarkdownService } from 'ngx-markdown';
import Tocify, { TocItem } from './tocify';

@Component({
  selector: 'component-markdown-render',
  templateUrl: './markdown-render.component.html',
  styleUrls: ['./markdown-render.component.scss'],
})
export class MarkdownRenderComponent
  implements OnInit, OnChanges, AfterViewInit {
  @Input()
  showToc = false;
  @Input()
  showScroll = true;
  @Input()
  data = '';

  @ViewChild('toc', { static: false }) tocEl: ElementRef;
  @ViewChild('leftContent', { static: false }) leftEl: ElementRef;
  @ViewChild('render', { static: false }) scrollEl: ElementRef;

  private toc = [];
  tocStr = '';
  sticky = false;
  windowScrolled = false;
  tocify = new Tocify();

  private lastTocId: string;
  private scrollItems: any[] = [];

  constructor(
    private markdownService: MarkdownService,
    private location: Location,
    private route: ActivatedRoute,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private myElement: ElementRef
  ) {}

  ngOnInit(): void {
    const markedOptions: any = this.markdownService.options;
    this.markdownService.renderer.heading = this.renderHeading(
      markedOptions
    ).bind(this);
  }

  ngAfterViewInit(): void {
    this.markdownService.compile(this.data);
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {}

  @HostListener('window:scroll', ['$event'])
  handleScroll(event) {
    const windowScroll = window.pageYOffset;
    const headerHeight = 64;
    let top = 0;
    if (this.scrollEl && this.scrollEl.nativeElement) {
      top = this.scrollEl.nativeElement.scrollTop;
    }

    this.sticky = windowScroll >= headerHeight;
    if (top <= headerHeight) {
      this.windowScrolled = false;
      return;
    }

    this.windowScrolled = true;
    this.handleForMenuSync(top);
  }

  private handleForMenuSync(top: number) {
    let currentElement: Element;
    for (const element of this.scrollItems) {
      if (element.offsetTop > top - 64) {
        currentElement = element;
        break;
      }
    }
    if (!currentElement) {
      return;
    }

    const headingId = currentElement.getAttribute('id');
    const tocLink = document.getElementById('menu-' + headingId);
    if (!!tocLink) {
      if (!!this.lastTocId) {
        const lastElement = document.getElementById('menu-' + this.lastTocId);
        lastElement.classList.remove('active');
      }

      tocLink.classList.add('active');
      tocLink.scrollIntoView();
      this.lastTocId = headingId;
    }
  }

  scrollToTop() {
    this.sticky = false;
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    if (this.scrollEl && this.scrollEl.nativeElement) {
      this.scrollEl.nativeElement.scrollTop = 0;
    }
    if (this.leftEl && this.leftEl.nativeElement) {
      this.leftEl.nativeElement.scrollTop = 0;
    }
  }

  render() {
    const items = this.tocify.tocItems;
    this.tocStr = this.renderToc(items).join('');
    if (this.tocEl && this.tocEl.nativeElement) {
      this.tocEl.nativeElement.innerHTML = this.tocStr;
    }
    this.tocify.reset();

    setTimeout(() => this.startSyncMenu(), 10);
    setTimeout(() => this.gotoHeading(), 500);
  }

  private startSyncMenu() {
    this.scrollItems = [];
    const elements = document.getElementsByClassName('ledge-heading');
    Array.from(elements).forEach((el) => {
      this.scrollItems.push(el);
    });
  }

  private gotoHeading() {
    this.route.fragment.subscribe((fragment: string) => {
      if (!!fragment) {
        const element = this.myElement.nativeElement.querySelector(
          '#' + fragment
        );
        if (!!element) {
          element.scrollIntoView();
        }
      }
    });
  }

  private renderHeading(options: any) {
    return (text: string, level: number, raw: string, slugger: Slugger) => {
      const anchor = slugger.slug(raw);
      this.tocify.add(text, level, '', anchor);
      if (options.headerIds) {
        return `<h${level} class="ledge-heading" id="${options.headerPrefix}${anchor}">${text}</h${level}>`;
      }
      return `<h${level} class="ledge-heading" id="${options.headerPrefix}${anchor}">${text}</h${level}>`;
    };
  }

  private renderToc(items: TocItem[]) {
    return items.map((item) => {
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
}
