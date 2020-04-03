import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { StorageMap } from '@ngx-pwa/local-storage';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-case-study',
  templateUrl: './case-study.component.html',
  styleUrls: ['./case-study.component.scss'],
})
export class CaseStudyComponent implements OnInit {
  cases = [
    { displayName: '美团', source: 'meituan' },
    { displayName: 'Ledge', source: 'ledge' },
    { displayName: '大型银行转型', source: 'tw-banks' },
    { displayName: 'DaoCloud', source: 'daocloud' },
    { displayName: '招商银行', source: 'cmb' },
    { displayName: 'HP', source: 'hp' },
    { displayName: 'Etsy', source: 'etsy' },
    { displayName: '中国银行', source: 'china-bank' },
    { displayName: '携程', source: 'xuecheng' },
    { displayName: '农业银行', source: 'nonghang' },
    { displayName: '华为', source: 'huawei' },
    { displayName: '百度', source: 'baidu' },
    { displayName: '腾讯', source: 'tencent' },
    { displayName: '博云', source: 'bocloud' },
    { displayName: '阿里巴巴', source: 'alibaba' },
    { displayName: 'Atlassian', source: 'atlassian' },
    { displayName: '政采云', source: 'zhengcaiyun' },
    { displayName: '大搜车', source: 'dasouche' },
    { displayName: '小米', source: 'xiaomi' },
    { displayName: '微博', source: 'weibo' },
  ];
  currentSource: string;
  src: string;
  content: string;

  constructor(
    title: Title,
    private storage: StorageMap,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    title.setTitle('DevOps 知识平台 Ledge - 案例学习');
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const source = params.source;
      if (source) {
        this.configSource(source);
      } else {
        this.getSourceFromLocalStorage();
      }
    });
  }

  private getSourceFromLocalStorage() {
    this.storage.get('casestudy.last').subscribe((value: string) => {
      if (!!value) {
        this.configSource(value);
      } else {
        this.configSource('meituan');
      }
    });
  }

  private configSource(value: string) {
    this.getCase(value);
  }

  getCase(source: string) {
    this.src = this.buildSrc(source);
    this.currentSource = source;

    const headers = new HttpHeaders().set(
      'Content-Type',
      'text/plain; charset=utf-8'
    );
    this.http
      .get(this.src, { headers, responseType: 'text' })
      .subscribe((response) => {
        this.storage.set('casestudy.last', source).subscribe();
        this.content = response;
        const queryParams: Params = { source };
        this.router.navigate([], {
          relativeTo: this.activatedRoute,
          queryParams,
          queryParamsHandling: 'merge', // remove to replace all query params by provided
        });
      });
  }

  private buildSrc(source: string) {
    return `assets/docs/casestudies/${source}.md`;
  }
}
