import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Practises, practises } from './practise';

@Component({
  selector: 'app-practise',
  templateUrl: './practise.component.html',
  styleUrls: ['./practise.component.scss'],
})
export class PractiseComponent implements OnInit {
  currentSource: string;
  src: string;
  content: string;
  tanks: Practises = practises;

  constructor(
    private title: Title,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((p) => {
      const param = p.get('practise');
      const currentCase = this.tanks.find((ca) => ca.source === param);
      this.title.setTitle(
        `『DevOps 最佳实践』 — ${currentCase.displayName} - Ledge DevOps 知识平台`
      );
      this.configSource(param);
    });
  }

  private configSource(value: string) {
    this.getCase(value);
  }

  async getCase(source: string) {
    this.src = this.buildSrc(source);
    this.currentSource = source;

    const headers = new HttpHeaders().set(
      'Content-Type',
      'text/plain; charset=utf-8'
    );
    this.http
      .get(this.src, { headers, responseType: 'text' })
      .subscribe((response) => {
        this.content = response;
      });
  }

  private buildSrc(source: string) {
    return `assets/docs/practises/${source}.md`;
  }
}
