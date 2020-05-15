import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'tohtml' })
export class TohtmlPipe implements PipeTransform {
  constructor(private dom: DomSanitizer) {}

  transform(html: string): string | SafeHtml {
    return html ? this.dom.bypassSecurityTrustHtml(html) : '';
  }
}
