import { AfterViewInit, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-toolset',
  template: `
    <ng-container #dynamicTemplate></ng-container>
  `,
  styleUrls: ['./toolset.component.scss']
})
export class ToolsetComponent implements AfterViewInit, OnInit {
  @ViewChild('dynamicTemplate', {read: ViewContainerRef}) dynamicTemplate;

  constructor() {
  }

  ngAfterViewInit() {

  }

  ngOnInit(): void {
  }
}
