import { Component, OnInit } from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-case-study',
  templateUrl: './case-study.component.html',
  styleUrls: ['./case-study.component.scss']
})
export class CaseStudyComponent implements OnInit {

  constructor(title: Title) {
    title.setTitle('DevOps 学习平台 Ledge - 案例学习');
  }

  ngOnInit(): void {
  }

}
