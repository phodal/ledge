import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ledge-helper',
  templateUrl: './ledge-helper.component.html',
  styleUrls: ['./ledge-helper.component.scss']
})
export class LedgeHelperComponent implements OnInit {
  content = `
# Syntax Test

\`\`\`javascript
console.log('hello, world');
\`\`\`

| | normal | table |
|-|-|-|
| | | |
| | | |

`;

  constructor() { }

  ngOnInit(): void {
  }

  changeContent($event: any) {
    this.content = $event;
  }
}
