import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-case-study',
  templateUrl: './case-study.component.html',
  styleUrls: ['./case-study.component.scss']
})
export class CaseStudyComponent implements OnInit {
  cases = [
    {displayName: 'DaoCloud', source: 'daocloud'},
    {displayName: '美团外卖', source: 'meituan'},
    {displayName: '招商银行', source: 'cmb'},
  ];
  src = `assets/docs/casestudies/meituan.md`;

  constructor(title: Title) {
    title.setTitle('DevOps 学习平台 Ledge - 案例学习');
  }

  ngOnInit(): void {
  }

  clickCase(source: string) {
    this.src = `assets/docs/casestudies/${source}.md`;
  }
}
