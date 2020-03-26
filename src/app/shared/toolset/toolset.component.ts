import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-toolset',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss']
})
export class ToolsetComponent implements OnInit {

  @Input()
  option: ToolsetOption;

  constructor() { }

  ngOnInit(): void {
  }

}
