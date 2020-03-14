import { Component, OnInit } from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss']
})
export class ResourcesComponent implements OnInit {

  constructor(title: Title) {
    title.setTitle('DevOps 知识平台 Ledge - 相关资源');
  }

  ngOnInit(): void {
  }

}
