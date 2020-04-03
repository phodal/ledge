import { Component, OnInit } from '@angular/core';
import * as mdData from 'raw-loader!../../../assets/docs/mobile-andorid.md';

@Component({
  selector: 'app-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['./mobile.component.scss'],
})
export class MobileComponent implements OnInit {
  data = mdData.default;

  constructor() {}

  ngOnInit(): void {}
}
