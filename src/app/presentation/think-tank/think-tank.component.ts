import { Component, OnInit } from '@angular/core';
import * as mdData from 'raw-loader!../../../assets/docs/qa.md';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-think-tank',
  templateUrl: './think-tank.component.html',
  styleUrls: ['./think-tank.component.scss'],
})
export class ThinkTankComponent implements OnInit {
  data = mdData.default;

  constructor(title: Title) {
    title.setTitle('Ledge DevOps 知识平台 - 智库');
  }

  ngOnInit(): void {}
}
