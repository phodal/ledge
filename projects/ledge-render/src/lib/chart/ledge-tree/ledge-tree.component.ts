import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { LedgeListItem } from '../../components/model/ledge-chart.model';
import * as d3 from 'd3';

@Component({
  selector: 'ledge-tree',
  templateUrl: './ledge-tree.component.html',
  styleUrls: ['./ledge-tree.component.scss']
})
export class LedgeTreeComponent implements OnInit, OnChanges {
  @Input()
  data: LedgeListItem[];

  @Input()
  config: any;

  @ViewChild('chart', {}) chartEl: ElementRef;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      this.data = changes.data.currentValue;
      setTimeout(() => {
        this.render(this.data[0]);
      });
    }
  }

  private render(treeData) {
    // MI: https://bl.ocks.org/d3noob/1a96af738c89b88723eb63456beb6510
    const chartElement = this.chartEl.nativeElement;
    // Set the dimensions and margins of the diagram
    const margin = {top: 20, right: 90, bottom: 30, left: 90};
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    const svg = d3.select(chartElement).append('svg')
      .attr('width', width + margin.right + margin.left)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate('
        + margin.left + ',' + margin.top + ')');

    let i = 0;
    const duration = 750;
    let root;

    // declares a tree layout and assigns the size
    const treemap = d3.tree().size([height, width]);

    // Assigns parent, children, height, depth
    root = d3.hierarchy(treeData, (d: any) => d.children);
    root.x0 = height / 2;
    root.y0 = 0;

    // Collapse after the second level
    root.children.forEach(collapse);

    update(root);

    // Collapse the node and all it's children
    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    function update(source) {
      // Assigns the x and y position for the nodes
      const treemapDatta = treemap(root);

      // Compute the new tree layout.
      const nodes = treemapDatta.descendants();
      const links = treemapDatta.descendants().slice(1);

      // Normalize for fixed-depth.
      nodes.forEach(d => {
        d.y = d.depth * 180;
      });

      // ****************** Nodes section ***************************

      // Update the nodes...
      const node = svg.selectAll('g.node')
        .data(nodes, (d: any) => d.id || (d.id = ++i));

      // Enter any new modes at the parent's previous position.
      const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform', d => 'translate(' + source.y0 + ',' + source.x0 + ')')
        .on('click', click);

      // Add Circle for the nodes
      nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style('fill', (d: any) => d._children ? 'lightsteelblue' : '#fff');

      // Add labels for the nodes
      nodeEnter.append('text')
        .attr('dy', '.35em')
        .attr('x', (d: any) => d.children || d._children ? -13 : 13)
        .attr('text-anchor', (d: any) => d.children || d._children ? 'end' : 'start')
        .text((d: any) => d.data.name);

      // UPDATE
      const nodeUpdate = nodeEnter.merge(node as any);

      // Transition to the proper position for the node
      nodeUpdate.transition()
        .duration(duration)
        .attr('transform', d => 'translate(' + d.y + ',' + d.x + ')');

      // Update the node attributes and style
      nodeUpdate.select('circle.node')
        .attr('r', 10)
        .style('fill', (d: any) => d._children ? 'lightsteelblue' : '#fff')
        .attr('cursor', 'pointer');


      // Remove any exiting nodes
      const nodeExit = node.exit().transition()
        .duration(duration)
        .attr('transform', d => 'translate(' + source.y + ',' + source.x + ')')
        .remove();

      // On exit reduce the node circles size to 0
      nodeExit.select('circle')
        .attr('r', 1e-6);

      // On exit reduce the opacity of text labels
      nodeExit.select('text')
        .style('fill-opacity', 1e-6);

      // ****************** links section ***************************

      // Update the links...
      const link = svg.selectAll('path.link')
        .data(links, (d: any) => d.id);

      // Enter any new links at the parent's previous position.
      const linkEnter = link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr('d', d => {
          const o = {x: source.x0, y: source.y0};
          return diagonal(o, o);
        });

      // UPDATE
      const linkUpdate = linkEnter.merge(link as any);

      // Transition back to the parent element position
      linkUpdate.transition()
        .duration(duration)
        .attr('d', d => diagonal(d, d.parent));

      // Remove any exiting links
      const linkExit = link.exit().transition()
        .duration(duration)
        .attr('d', d => {
          const o = {x: source.x, y: source.y};
          return diagonal(o, o);
        })
        .remove();

      // Store the old positions for transition.
      nodes.forEach((d: any) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      // Creates a curved (diagonal) path from parent to the child nodes
      function diagonal(s, d) {
        const path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;
        return path;
      }

      // Toggle children on click.
      function click(d) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);
      }
    }
  }
}
