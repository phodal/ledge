import { Component, OnInit } from '@angular/core';
import * as mdData from 'raw-loader!../../../assets/docs/reporter.md';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-reporter',
  templateUrl: './reporter.component.html',
  styleUrls: ['./reporter.component.scss'],
})
export class ReporterComponent implements OnInit {
  content = mdData.default;

  constructor(title: Title) {
    title.setTitle('Ledge DevOps 知识平台 - 年度报告');
  }

  ngOnInit(): void {}
}
