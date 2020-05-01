import { Component, OnInit } from '@angular/core';
import * as mdData from 'raw-loader!../../../assets/docs/toolset.md';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-toolset',
  templateUrl: './toolset.component.html',
  styleUrls: ['./toolset.component.scss'],
})
export class ToolsetComponent implements OnInit {
  data = mdData.default;

  constructor(private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('DevOps 实施工具集 - Ledge DevOps 知识平台');
  }
}
