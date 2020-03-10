import { Component, OnInit } from '@angular/core';
import { MarkdownService } from 'ngx-markdown';

@Component({
  selector: 'app-pattern',
  templateUrl: './pattern.component.html',
  styleUrls: ['./pattern.component.scss']
})
export class PatternComponent implements OnInit {

  constructor(private markdownService: MarkdownService) { }

  ngOnInit(): void {
  }

}
