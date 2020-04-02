import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { StorageMap } from '@ngx-pwa/local-storage';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss']
})
export class SolutionComponent implements OnInit {
  solutions = [
    {displayName: 'Coding', source: 'coding'},
  ];
  currentSource: string;
  src: string;

  constructor(title: Title, private storage: StorageMap, private activatedRoute: ActivatedRoute, private router: Router) {
    title.setTitle('DevOps 知识平台 Ledge - 解决方案');
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
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
    this.currentSource = value;
    this.src = this.buildSrc(this.currentSource);
  }

  clickCase(source: string) {
    this.src = this.buildSrc(source);
    this.currentSource = source;

    this.storage.set('solution.last', source).subscribe();

    const queryParams: Params = { source };
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams,
        queryParamsHandling: 'merge', // remove to replace all query params by provided
      });
  }

  private buildSrc(source: string) {
    return `assets/docs/solutions/${source}.md`;
  }
}
