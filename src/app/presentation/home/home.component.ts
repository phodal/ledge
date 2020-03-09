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

  constructor(titleService: Title) {
    titleService.setTitle('Periodic Table');
  }

  highlightElement(highlightState: HighlightState) {
    this.highlightState = highlightState;
  }

  setCurrentAtomCategory(category: string) {
    this.category = category;
  }

  ngOnInit(): void {
  }
}
