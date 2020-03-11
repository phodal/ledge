import { Component, OnInit } from '@angular/core';
import {StorageMap} from '@ngx-pwa/local-storage';

@Component({
  selector: 'component-path',
  templateUrl: './path.component.html',
  styleUrls: ['./path.component.scss']
})
export class PathComponent implements OnInit {
  pipeData = [
    {
      id: 1,
      title: 'Process',
      items: [
        // tslint:disable-next-line:max-line-length
        'Commit Code', 'PUSH Hooks', 'RUN CI', 'Deploy Dev', 'E2E Test', 'Manual Test', 'Deploy UAT', 'Manual Test', 'Go-Live Apply', 'Go-Live'
      ],
      backgroundColor: '#00a300',
      textColor: '#ffffff'
    },
    {
      id: 2,
      title: 'People',
      items: [
        ''
      ],
      backgroundColor: '#ff0097',
      textColor: '#ffffff'
    },
    {
      id: 3,
      title: 'Tooling',
      items: [
        'Git & GitHub', 'Git', 'Jenkins', '', '', '', '', ''
      ],
      backgroundColor: '#99b433',
      textColor: '#ffffff'
    },
    {
      id: 4,
      title: 'Artifacts',
      items: [
        'Code', '', 'Build Log', '', '', '', '', '', '', ''
      ],
      backgroundColor: '#1e7145',
      textColor: '#ffffff'
    },
    {
      id: 5,
      title: 'Pain',
      items: [
        ''
      ],
      backgroundColor: '#00aba9',
      textColor: '#ffffff'
    },
    {
      id: 6,
      title: 'Duration',
      items: [
        ''
      ],
      backgroundColor: '#ffc40d',
      textColor: '#ffffff'
    }
  ];

  constructor(private storage: StorageMap) {}

  ngOnInit(): void {

  }

  addColumn() {

  }
}
