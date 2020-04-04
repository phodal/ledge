import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import * as d3 from 'd3';
import * as dagreD3 from 'dagre-d3';
import * as graphlibDot from 'graphlib-dot';

@Component({
  selector: 'ledge-graphviz',
  templateUrl: './ledge-graphviz.component.html',
  styleUrls: ['./ledge-graphviz.component.scss'],
})
export class LedgeGraphvizComponent implements OnInit, AfterViewInit {
  @Input()
  data: string;

  @ViewChild('chart', {}) reporter: ElementRef;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const render = dagreD3.render();
    const g = graphlibDot.read(this.data);

    setTimeout(() => {
      d3.select(this.reporter.nativeElement).select('svg').call(render, g);
    });
  }
}
