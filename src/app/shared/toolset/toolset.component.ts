import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'toolset',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss']
})
export class ToolsetComponent implements OnInit, AfterViewInit {
  @ViewChild('tool', {}) toolEl: ElementRef;

  @Input()
  option: ToolsetOption;

  constructor() {
  }

  ngOnInit(): void {
    console.log(this.option);
  }

  setToolsetStyle(option: ToolsetOption) {
    const element = document.getElementById(option.id);
    if (element == null) {
      return;
    }

    if (this.toolEl && this.toolEl.nativeElement) {
      this.toolEl.nativeElement.setAttribute('style', `z-index: 999; top: ${element.offsetTop}px;position:absolute`);
      if (this.toolEl.nativeElement.clientHeight !== 0) {
        element.setAttribute('style', `height: calc(${this.toolEl.nativeElement.clientHeight}px + 2em)`);
      }
    }
  }

  ngAfterViewInit(): void {
    this.setToolsetStyle(this.option);
  }
}
