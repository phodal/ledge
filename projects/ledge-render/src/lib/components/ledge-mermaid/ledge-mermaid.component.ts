import { Component, OnInit, Input } from '@angular/core';
import * as mermaid from 'mermaid';

@Component({
  selector: 'ledge-mermaid',
  templateUrl: './ledge-mermaid.component.html',
  styleUrls: ['./ledge-mermaid.component.scss'],
})
export class LedgeMermaidComponent implements OnInit {
  @Input()
  data: string;
  code: string;
  constructor() {}

  ngOnInit(): void {
    mermaid.default.mermaidAPI.render(
      `mermaid-${Math.random().toString(32).slice(2)}`,
      this.data,
      (code) => {
        this.code = code;
      }
    );
  }
}
