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

  constructor() {
  }

  ngOnInit(): void {
    mermaid.default.mermaidAPI.initialize({
      theme: 'default',
      gantt: {
        titleTopMargin: 25,
        barHeight: 48,
        barGap: 4,
        topPadding: 50,
        leftPadding: 75,
        gridLineStartPadding: 35,
        fontSize: 18,
        fontFamily: '"Open-Sans", "sans-serif"',
        numberSectionStyles: 4,
        axisFormat: '%Y-%m-%d',
      }
    });

    mermaid.default.mermaidAPI.render(
      `mermaid-${Math.random().toString(32).slice(2)}`,
      this.data,
      (code) => {
        this.code = code;
      }
    );
  }
}
