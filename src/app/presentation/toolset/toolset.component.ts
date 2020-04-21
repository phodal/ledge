import { Component, OnInit } from '@angular/core';
import * as mdData from 'raw-loader!../../../assets/docs/tool.md';

@Component({
  selector: 'app-toolset',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss'],
})
export class ToolsetComponent implements OnInit {
  data = mdData.default;

  ngOnInit(): void {}
}
