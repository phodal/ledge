import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as mdData from 'raw-loader!../../../assets/docs/resources.md';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss'],
})
export class ResourcesComponent implements OnInit {
  data = mdData.default;

  constructor(title: Title) {
    title.setTitle('Ledge DevOps 知识平台 - 相关资源');
  }

  ngOnInit(): void {}
}
