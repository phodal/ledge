import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'toolset',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss']
})
export class ToolsetComponent implements OnInit {
  @ViewChild('tool', {}) toolEl: ElementRef;

  @Input()
  option: ToolsetOption;

  constructor() { }

  ngOnInit(): void {
    console.log(this.option);
  }

  setToolsetStyle(option: ToolsetOption) {
    const element = document.getElementById(option.id);
    if (element == null) {
      return;
    }

    if (this.toolEl && this.toolEl.nativeElement) {
      element.setAttribute('style', `height: ${this.toolEl.nativeElement.clientHeight}px`);
    }

    return {
      zIndex: 999,
      top: element.offsetTop + 'px',
      position: 'absolute'
    };
  }
}
