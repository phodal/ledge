import { Component, OnInit } from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-pattern',
  templateUrl: './pattern.component.html',
  styleUrls: ['./pattern.component.scss']
})
export class PatternComponent implements OnInit {

  constructor(title: Title) {
    title.setTitle('DevOps 知识平台 Ledge - 原则与模式');
  }

  ngOnInit(): void {
  }

}
