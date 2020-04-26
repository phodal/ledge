import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as dagreD3 from 'dagre-d3';
import * as graphlibDot from 'graphlib-dot';

@Component({
  selector: 'ledge-graphviz',
  templateUrl: './ledge-graphviz.component.html',
  styleUrls: ['./ledge-graphviz.component.scss'],
})
export class LedgeGraphvizComponent implements AfterViewInit {
  @Input()
  data: string;

  @ViewChild('chart', {}) reporter: ElementRef;

  ngAfterViewInit(): void {
    setTimeout(() => {
      const rootSvg = d3.select(this.reporter.nativeElement).select('svg');
      const inner = d3.select(this.reporter.nativeElement).select('svg g');
      const zoom = d3.zoom().on('zoom', () => {
          inner.attr('transform', d3.event.transform);
        });

      rootSvg.call(zoom);

      const render = dagreD3.render();
      const g = graphlibDot.read(this.data);
      d3.select(this.reporter.nativeElement).select('svg g').call(render, g);
    });
  }
}
