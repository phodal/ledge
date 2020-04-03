import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { StorageMap } from '@ngx-pwa/local-storage';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss'],
})
export class SolutionComponent implements OnInit {
  solutions = [{ displayName: 'Coding', source: 'coding' }];
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
    title.setTitle('Ledge DevOps 知识平台 - 解决方案');
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
    this.storage.get('solution.last').subscribe((value: string) => {
      if (!!value) {
        this.configSource(value);
      } else {
        this.configSource('coding');
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
        const queryParams: Params = { source };
        this.storage.set('solution.last', source).subscribe();
        this.content = response;

        this.router.navigate([], {
          relativeTo: this.activatedRoute,
          queryParams,
          queryParamsHandling: 'merge', // remove to replace all query params by provided
        });
      });
  }

  private buildSrc(source: string) {
    return `assets/docs/solutions/${source}.md`;
  }
}
