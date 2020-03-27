import { Component, OnInit } from '@angular/core';
import * as mdData from 'raw-loader!../../../assets/docs/tool.md';

@Component({
  selector: 'app-awesome-tool',
  templateUrl: './awesome-tool.component.html',
  styleUrls: ['./awesome-tool.component.scss']
})
export class AwesomeToolComponent implements OnInit {
  data = mdData.default;

  constructor() { }

  ngOnInit(): void {
  }

}
