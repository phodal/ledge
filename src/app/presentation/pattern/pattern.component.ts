import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as mdData from 'raw-loader!../../../assets/docs/pattern.md';

@Component({
  selector: 'app-pattern',
  templateUrl: './pattern.component.html',
  styleUrls: ['./pattern.component.scss'],
})
export class PatternComponent implements OnInit {
  data = mdData.default;

  constructor(title: Title) {
    title.setTitle('DevOps 原则与模式 - Ledge DevOps 知识平台');
  }

  ngOnInit(): void {}
}
