import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {StorageMap} from '@ngx-pwa/local-storage';

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
    {displayName: 'HP', source: 'hp'},
    {displayName: 'Etsy', source: 'etsy'},
  ];
  currentSource = 'meituan';
  src = this.buildSrc(this.currentSource);

  constructor(title: Title, private storage: StorageMap) {
    title.setTitle('DevOps 学习平台 Ledge - 案例学习');
    this.storage.get('casestudy.last').subscribe((value: string) => {
      if (!!value) {
        this.currentSource = value;
        this.src = this.buildSrc(this.currentSource);
      }
    });
  }

  ngOnInit(): void {

  }

  clickCase(source: string) {
    this.src = this.buildSrc(source);
    this.currentSource = source;

    this.storage.set('casestudy.last', source).subscribe();
  }

  private buildSrc(source: string) {
    return `assets/docs/casestudies/${source}.md`;
  }
}
