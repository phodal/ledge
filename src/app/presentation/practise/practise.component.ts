import { Component, OnInit } from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-practise',
  templateUrl: './practise.component.html',
  styleUrls: ['./practise.component.scss']
})
export class PractiseComponent implements OnInit {

  constructor(title: Title) {
    title.setTitle('DevOps 学习平台 Ledge - 最佳实践');
  }

  ngOnInit(): void {
  }

}
