import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'toolset',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss']
})
export class ToolsetComponent implements OnInit {
  @Input()
  option: ToolsetOption;

  constructor() { }

  ngOnInit(): void {
    console.log(this.option);
  }

  buildStyle(option: ToolsetOption) {
    const element = document.getElementById(option.id);
    if (element == null) {
      return;
    }

    return {
      zIndex: 999,
      top: element.offsetTop + 'px',
      position: 'absolute'
    };
  }
}
