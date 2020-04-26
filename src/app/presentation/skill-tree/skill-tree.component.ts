import { Component, OnInit } from '@angular/core';
import * as mdData from 'raw-loader!../../../assets/docs/skilltree.md';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-skill-tree',
  templateUrl: './skill-tree.component.html',
  styleUrls: ['./skill-tree.component.scss'],
})
export class SkillTreeComponent implements OnInit {
  data: any = mdData.default;

  constructor(private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle(`DevOps 技能图谱 - DevOps 知识平台`);
  }
}
