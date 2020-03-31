import { Component, OnInit } from '@angular/core';
import * as mdData from 'raw-loader!../../../assets/docs/reporter.md';

@Component({
  selector: 'app-reporter',
  templateUrl: './reporter.component.html',
  styleUrls: ['./reporter.component.scss']
})
export class ReporterComponent implements OnInit {
  content = mdData.default;

  constructor() { }

  ngOnInit(): void {
  }

}
