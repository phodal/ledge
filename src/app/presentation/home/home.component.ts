import { Component, OnInit } from '@angular/core';
import { HighlightState } from '../../features/shared';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  highlightState: HighlightState;
  category: string;

  constructor(title: Title) {
    title.setTitle('DevOps 学习平台 Ledge - Periodic Table');
  }

  setCurrentAtomCategory(category: string) {
    this.category = category;
  }

  ngOnInit(): void {
  }
}
