import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ledge-step-line',
  templateUrl: './ledge-step-line.component.html',
  styleUrls: ['./ledge-step-line.component.scss']
})
export class LedgeStepLineComponent implements OnInit {

  @Input() data = [];

  stepLineData = [];

  constructor() { }

  ngOnInit(): void {

  }


}


