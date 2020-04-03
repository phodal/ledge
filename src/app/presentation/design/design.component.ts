import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-design',
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.scss'],
})
export class DesignComponent implements OnInit {
  constructor(title: Title) {
    title.setTitle('Ledge DevOps 知识平台 - 设计 Devops');
  }

  ngOnInit(): void {}
}
