import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

const BASE_URL = 'https://en.wikipedia.org/wiki';

@Component({
  selector: 'app-wiki',
  template: `
      <div class="modal-content" #modalContent>
          <div class="close-modal" #closeModalDiv><p class="close-icon" (click)="closeModal.emit()">X</p></div>
          <iframe [src]="url" #iframe></iframe>
          <div class="loader" #loader><p class="text">Loading Content...</p></div>
      </div>
  `,
  styles: [
      `
          :host {
              position: fixed;
              left: 0;
              top: 0;
              bottom: 0;
              right: 0;
              background: rgba(0, 0, 0, 0.4);
              z-index: 1000;
          }

          .modal-content {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 80%;
              height: 80%;
          }

          .close-modal {
              display: none;
              position: absolute;
              top: 0.625rem;
              right: 0.625rem;
          }

          .close-icon {
              padding: 0.25rem;
              border: 1px solid black;
              border-radius: 50%;
          }

          iframe {
              position: absolute;
              top: 3rem;
              opacity: 0;
              width: 0;
              height: 0;
              border: 0;
          }

          .loader {
              position: absolute;
              opacity: 1;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 40%;
              height: 15%;
              background: #fff;

              display: flex;
              justify-content: center;
              align-items: center;
              font-size: 2em;
              color: blue;
          }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppWikiComponent implements OnInit, AfterViewInit {
  @Input()
  atomName: string;

  @Output()
  closeModal = new EventEmitter<void>();

  @ViewChild('iframe')
  iframe: ElementRef<HTMLIFrameElement>;

  @ViewChild('closeModalDiv')
  closeModalDiv: ElementRef<HTMLDivElement>;

  @ViewChild('loader')
  loader: ElementRef<HTMLDivElement>;

  @ViewChild('modalContent')
  modalContent: ElementRef<any>;

  url: SafeUrl;

  constructor(private santiizer: DomSanitizer, private renderer: Renderer2) {
  }

  ngOnInit() {
    this.url = this.santiizer.bypassSecurityTrustResourceUrl(`${BASE_URL}/${this.atomName}`);
  }

  ngAfterViewInit() {
    const el = this.iframe.nativeElement;
    el.onload = () => {
      this.renderer.setStyle(this.getNativeElement(this.loader), 'opacity', '0');
      this.renderer.setStyle(this.getNativeElement(this.loader), 'width', '0');
      this.renderer.setStyle(this.getNativeElement(this.loader), 'height', '0');
      this.renderer.setStyle(el, 'opacity', '1');
      this.renderer.setStyle(el, 'width', '100%');
      this.renderer.setStyle(el, 'height', 'calc(100% - 3rem)');
      this.renderer.setStyle(this.getNativeElement(this.closeModalDiv), 'display', 'block');
      this.renderer.setStyle(this.getNativeElement(this.modalContent), 'background', '#fff');
    };
  }

  private getNativeElement(el: ElementRef) {
    return el.nativeElement;
  }
}
