import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { LedgeListItem } from '../../components/model/ledge-chart.model';
import * as d3 from 'd3';

@Component({
  selector: 'ledge-tech-radar',
  templateUrl: './ledge-tech-radar.component.html',
  styleUrls: ['./ledge-tech-radar.component.scss']
})
export class LedgeTechRadarComponent implements OnInit, OnChanges {
  @ViewChild('chart', {static: false}) chartEl: ElementRef;

  @Input()
  data: LedgeListItem[];

  @Input()
  config: any;

  trData: {
    name: string,
    items: any[],
  }[] = [];

  constructor() {
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      this.data = changes.data.currentValue;
      this.rebuildRadarData();
      setTimeout(() => {
        this.renderData(this.trData);
      });
    }
  }

  private rebuildRadarData() {
    this.trData = [];
    for (const item of this.data.slice(0, 4)) {
      const items = [];
      for (const levelList of item.children) {
        const level = this.getLevelByName(levelList.name);
        if (levelList.children) {
          for (const finalItem of levelList.children) {
            items.push({
              name: finalItem.name,
              circle: level
            });
          }
        }
      }

      this.trData.push({
        name: item.name,
        items
      });
    }
  }

  getLevelByName(name: string) {
    let level = 0;
    switch (name.toLowerCase()) {
      case 'adopt':
        level = 1;
        break;
      case 'trail':
        level = 2;
        break;
      case 'assess':
        level = 3;
        break;
      case 'hold':
        level = 4;
        break;
      default:
        level = 0;
    }

    return level;
  }

  private renderData(treeData) {
    const chartElement = this.chartEl.nativeElement;

    // based on: https://cofinpro.github.io/Tech-Radar/
    let axisLabels = ['', 'Adopt', 'Trail', 'Assess', 'Hold'].reverse();
    if (this.config && !!this.config.hiddenLegend) {
      axisLabels = ['', '', '', '', ''];
    }

    const cfg = {
      w: 600,				// Width of the circle
      h: 600,				// Height of the circle
      margin: {top: 10, right: 20, bottom: 10, left: 10}, // The margins of the SVG
      levels: 5,				// How many levels or inner circles should there be drawn
      labelFactor: 1.1, 	// How much farther than the radius of the outer circle should the labels be placed
      dotRadius: 15, 			// The size of the colored circles of each blog
      color: d3.schemeCategory10	// Color function
    };

    const radar = d3.select(chartElement);
    drawChart(enrichData(treeData));

    function drawChart(data) {
      const allAxis = (d3.keys(data));           	// Names of each axis
      const total = allAxis.length;					// The number of different axes
      const radius = Math.min(cfg.w / 2, cfg.h / 2); 	// Radius of the outermost circle
      const angleSlice = Math.PI * 2 / total;		// The width in radians of each "slice"

      // Scale for the radius
      const rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, 1]);

      /////////////////////////////////////////////////////////
      //////////// Create the container SVG and g /////////////
      /////////////////////////////////////////////////////////

      // Initiate the radar chart SVG
      const width = cfg.w + cfg.margin.left + cfg.margin.right;
      const height = cfg.h + cfg.margin.top + cfg.margin.bottom;
      const svg = d3.select(chartElement)
        .append('div')
        .attr('id', 'radarChart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`);

      const g = svg.append('g')
        .attr('transform', 'translate(' + (cfg.w / 2 + cfg.margin.left) + ',' + (cfg.h / 2 + cfg.margin.top) + ')');


      /////////////////////////////////////////////////////////
      /////////////// Draw the Circular grid //////////////////
      /////////////////////////////////////////////////////////

      // Wrapper for the grid & axes
      const axisGrid = g.append('g').attr('class', 'axisWrapper');

      // Draw the background circles
      axisGrid.selectAll('.levels')
        .data(d3.range(1, cfg.levels).reverse())
        .enter()
        .append('circle')
        .attr('class', 'gridCircle, color-1')
        .attr('r', d => radius / cfg.levels * (d + 1))
        .style('fill', 'transparent')
        .style('stroke-dasharray', '5,5');

      // Text indicating each stage
      axisGrid.selectAll('.axisLabel')
        .data(d3.range(1, (cfg.levels + 1)).reverse())
        .enter()
        .append('text')
        .attr('class', 'axisLabel')
        .attr('x', 4)
        .attr('y', d => -(d === 2 ? 0 : d - 1) * radius / cfg.levels - 12)
        .attr('dy', '0.4em')
        .text((d, i) => axisLabels[i]);

      /////////////////////////////////////////////////////////
      //////////////////// Draw the axes //////////////////////
      /////////////////////////////////////////////////////////

      // Create the straight lines radiating outward from the center
      const axis = axisGrid.selectAll('.axis')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'axis');
      // Append the lines
      axis.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (d, i) => rScale(1.1) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('y2', (d, i) => rScale(1.1) * Math.sin(angleSlice * i - Math.PI / 2))
        .attr('class', 'line, color-1')
        .style('stroke-width', '1px');

      // Append the labels at each axis
      axis.append('text')
        .attr('class', 'axisLabel')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('x', (d, i) => rScale(cfg.labelFactor) * Math.cos(angleSlice * (i - 1) - Math.PI / 4))
        .attr('y', (d, i) => rScale(cfg.labelFactor) * Math.sin(angleSlice * (i - 1) - Math.PI / 4))
        .text((d: any) => d.name);

      /////////////////////////////////////////////////////////
      ///////////// Draw the radar chart blobs ////////////////
      /////////////////////////////////////////////////////////

      // Create a dot for each technology in it's sector
      g.selectAll('.radarSections')
        .data(data)
        .enter()
        .append('g')
        .each(function(techSectionData: any, c) {

          const radarCircle = d3.select(this).selectAll('.radarCircle')
            .data(techSectionData.items)
            .enter()
            .append('g')
            .attr('transform', (innerData: any) => {
              const position = determinePosition(c, techSectionData.circleCounts[innerData.circle], innerData.idInCircle);
              const scaleParam = determineScaleForSingleDot(innerData.circle, cfg, radius);

              const x = rScale(scaleParam) * Math.cos(position - Math.PI / 2);
              const y = rScale(scaleParam) * Math.sin(position - Math.PI / 2);

              return `translate(${x}, ${y})`;
            })
            .attr('class', 'tech-circle')
            .on('click', handleClick)
            .on('mouseover', (event: any) => {
              d3.selectAll(`.legend li`)
                .classed('active', false)
                .filter((d: any) => {
                  return d.number === event.number;
                })
                .classed('active', true);
            });

          radarCircle.append('circle')
            .attr('class', 'radarCircle, color-' + (c + 1))
            .attr('r', cfg.dotRadius)
            .style('fill-opacity', 0.8)
            .append('title').text((d: any) => d.name);

          radarCircle
            .append('a')
            // .attr('href', () => `#${techSectionData.name}`)
            .append('text').text((rData: any) => rData.number)
            .attr('class', 'dot')
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central');
        });

      // draw the legend
      const legendSection = d3.select(chartElement)
        .selectAll('.legend')
        .data(data)
        .join('div')
        .attr('class', (d, i) => `legend legend-${i}`);

      // append the heading
      legendSection
        .append('h3').text((d: any) => d.name)
        .attr('id', (d: any) => d.name)
        .attr('class', (d: any, i) => 'color-' + (i + 1));

      // append the list
      legendSection.append('ol')
        .attr('start', (d: any) => d.items[0] ? d.items[0].number : 0)
        .selectAll('li')
        .data((d: any) => d.items)
        .enter()
        .append('li')
        .append('a')
        // .attr('href', '#radarChart')
        .on('click', handleClick)
        .text((d: any) => d.name);
    }

    /**
     * Returns a random number between min (inclusive) and max (exclusive)
     */
    function getRandomArbitrary(min, max) {
      return Math.random() * (max - min) + min;
    }


    /**
     * Assign a number to each technology and calculate the total number of technologies
     * per section and circle.
     */
    function enrichData(data) {
      let technologyNumber = 1;
      data.forEach(section => {
        section.circleCounts = {1: 0, 2: 0, 3: 0, 4: 0};
        section.items.sort((a, b) => a.circle - b.circle);
        section.items.forEach(technology => {
          technology.idInCircle = ++section.circleCounts[technology.circle];
          technology.number = technologyNumber++;
        });
      });
      return data;
    }

    function determinePosition(quarter, dotCountInArea, dotNumber) {
      const quarterStart = (Math.PI / 2) * (quarter - 1);
      const quarterEnd = (Math.PI / 2) * (quarter);

      const quarterSize = quarterEnd - quarterStart;
      const quarterSpacePerDot = quarterSize / (dotCountInArea + 1);

      return quarterStart + (quarterSpacePerDot * dotNumber);
    }

    function determineScaleForSingleDot(level, config, radius) {
      const halfCircleSizeInRelationToScale = (config.dotRadius / radius) / 2;
      const oneCirclesShareOfScale = 1 / config.levels;

      const beginOfScale = halfCircleSizeInRelationToScale;
      const endOfScale = oneCirclesShareOfScale - halfCircleSizeInRelationToScale;

      // If we have level 1, then draw on circle 0 or 1
      level = level === 1 ? getRandomArbitrary(0, 1) : level;

      const randomPointOnShareOfScale = getRandomArbitrary(beginOfScale, endOfScale);
      return ((level + 1) * oneCirclesShareOfScale) - randomPointOnShareOfScale;
    }

    function handleClick(data) {
      // First remove all click-handlers
      d3.selectAll('.active')
        .classed('active', false);

      const technology = d3.select(this).datum();

      d3.selectAll('.tech-circle')
        .filter((d: any) => d === technology)
        .classed('active', true);

      d3.selectAll(`.legend li`)
        .filter((d: any) => d === technology)
        .classed('active', true);
      //
      // d3.text(encodeURI(`tech/${data.name.toLocaleLowerCase()}.html`))
      //   .then(text => d3.select('#tech-info').html(text));

      // follow the href
      return true;
    }
  }
}
