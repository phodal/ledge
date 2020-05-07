import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import * as mdData from 'raw-loader!../../../assets/docs/guide.md';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss'],
})
export class GuideComponent implements OnInit {
  data = mdData.default;

  constructor(title: Title) {
    title.setTitle('一步步动手设计 DevOps - Ledge DevOps 知识平台');
  }

  ngOnInit(): void {}
}
