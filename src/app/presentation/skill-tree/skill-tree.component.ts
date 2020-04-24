import { Component, OnInit } from '@angular/core';
import * as mdData from 'raw-loader!../../../assets/docs/skilltree.md';

@Component({
  selector: 'app-skill-tree',
  templateUrl: './skill-tree.component.html',
  styleUrls: ['./skill-tree.component.scss'],
})
export class SkillTreeComponent implements OnInit {
  data: any = mdData.default;

  constructor() {}

  ngOnInit(): void {}
}
