import { Location } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { Slugger } from 'marked/lib/marked';
import { MarkdownService } from 'ngx-markdown';
import Tocify, { TocItem } from './tocify';

@Component({
  selector: 'ledge-markdown-render',
  templateUrl: './ledge-markdown-render.component.html',
  styleUrls: ['./ledge-markdown-render.component.scss'],
})
export class LedgeMarkdownRenderComponent
  implements OnInit, OnChanges, AfterViewInit {
  @Input() showToc = false;
  @Input() showScroll = true;
  @Input() data = '';
  @Input() virtualScroll = false;
  @Input() sourceDir;
  @Input() baseUrl =
    'https://github.com/phodal/ledge/edit/master/src/assets/docs/';

  @ViewChild('toc', { static: false }) tocEl: ElementRef;
  @ViewChild('tocLeft', { static: false }) tocLeftEl: ElementRef;
  @ViewChild('leftContent', { static: false }) leftEl: ElementRef;
  @ViewChild('render', { static: false }) scrollEl: ElementRef;

  private toc = [];
  tocStr = '';
  tocLeftStr = '';
  sticky = false;
  windowScrolled = false;
  tocify = new Tocify();
  tocSlugger = new Slugger();

  toItem = 0;
  tocFragmentMap = {};
  private tocIndex = -1;

  private lastTocId: string;
  private scrollItems: any[] = [];

  constructor(
    private markdownService: MarkdownService,
    private location: Location,
    private route: ActivatedRoute,
    private renderer2: Renderer2,
    private myElement: ElementRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    const markedOptions: any = this.markdownService.options;
    this.markdownService.renderer.heading = this.renderHeading(
      markedOptions
    ).bind(this);
    if (this.virtualScroll) {
      this.router.events.subscribe((event: any) => {
        if (event instanceof ActivationEnd) {
          const activationEnd = event as ActivationEnd;
          const tocIndex = this.tocFragmentMap[
            encodeURIComponent(activationEnd.snapshot.fragment)
          ];
          this.toItem = tocIndex;
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.markdownService.compile(this.data);
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      this.markdownService.compile(changes.data.currentValue);
      this.render();
    }
  }

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
    const menuElement = document.getElementById('menu-' + headingId);
    this.scrollToMenu(menuElement, headingId);
  }

  private scrollToMenu(tocLink: HTMLElement, headingId: string) {
    if (!!tocLink) {
      if (!!this.lastTocId) {
        const lastElement = document.getElementById('menu-' + this.lastTocId);
        lastElement.classList.add('prev');
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
    this.tocIndex = -1;
    this.tocStr = this.renderToc(items).join('');
    if (this.tocEl && this.tocEl.nativeElement) {
      this.tocEl.nativeElement.innerHTML = this.tocStr;
    }

    this.tocLeftStr = this.renderTocLeftPoint(items).join('');
    if (this.tocLeftEl && this.tocLeftEl.nativeElement) {
      this.tocLeftEl.nativeElement.innerHTML = this.tocLeftStr;
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
      if (!!fragment && typeof fragment === 'string') {
        try {
          const element = this.myElement.nativeElement.querySelector(
            '#' + fragment
          );
          if (!!element) {
            element.scrollIntoView();
          }
        } catch (e) {
          console.log(e);
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
      this.tocIndex++;
      const href = `${this.location.path()}#${item.anchor}`;
      const link = `<a id="menu-${item.anchor}" href="${href}" title=${item.text}>${item.text}</a>`;
      this.tocFragmentMap[encodeURIComponent(item.anchor)] = this.tocIndex;
      if (item.children) {
        const parentIndex = JSON.stringify(this.tocIndex);
        const childrenItems = this.renderToc(item.children);
        return `<div class="level_${
          item.level
        }" data-tocId="${parentIndex}">${link}
<div class="level_child">${childrenItems.join('')}</div>
</div>`;
      } else {
        return `<div class="level_${item.level}" data-tocId="${this.tocIndex}">${link}</div>`;
      }
    });
  }

  private renderTocLeftPoint(items: TocItem[]) {
    return items.map((item) => {
      if (item.children) {
        const childrenItems = this.renderTocLeftPoint(item.children);
        return `<div class="left-menu-${item.anchor}">
  <div>${childrenItems.join('')}</div>
</div>`;
      } else {
        return `<div class="left-menu-${item.anchor}"></div>`;
      }
    });
  }

  changeHeading($event: any) {
    const id: string = this.tocSlugger.slug($event.anchor);
    const headingId = `menu-${id}`;
    const menuElement = document.getElementById(headingId);
    this.scrollToMenu(menuElement, id);
  }
}
