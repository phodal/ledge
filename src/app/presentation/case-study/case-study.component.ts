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
    {displayName: '美团外卖', source: 'meituan'},
    {displayName: '大型银行转型', source: 'tw-banks'},
    {displayName: 'DaoCloud', source: 'daocloud'},
    {displayName: '招商银行', source: 'cmb'},
    {displayName: 'HP', source: 'hp'},
    {displayName: 'Etsy', source: 'etsy'},
    {displayName: '携程', source: 'xuecheng'},
    {displayName: '农业银行', source: 'nonghang'},
    {displayName: '华为', source: 'huawei'},
    {displayName: '博云', source: 'bocloud'},
  ];
  currentSource = 'meituan';
  src = this.buildSrc(this.currentSource);

  constructor(title: Title, private storage: StorageMap) {
    title.setTitle('DevOps 知识平台 Ledge - 案例学习');
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
