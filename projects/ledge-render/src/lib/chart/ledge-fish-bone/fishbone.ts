/*
The MIT License (MIT)

Copyright (c) 2014 Nicholas Bollweg <nick.bollweg@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
import * as d3 from 'd3';

const fishbone = () => {
  let marginSize = 50;
  let dataNodes = [];
  let dataLinks = [];

  const my: any = undefined;
  const width = 900;
  const height = 800;

  // d3 selections and related things used in tick function
  let node;
  let link;
  let root;

  const arrowId = () => 'arrow';
  let children = d => d.children;
  let label = d => {
    if (d.depth >= 1 && d.amount) {
      return d.name + ':' + d.amount;
    }
    return d.name;
  };

  let perNodeTick = d => {
  };

  const linkScale = d3.scaleLog()
    .domain([1, 5])
    .range([60, 30]);

  // const forceLayout = d3.layout.force()
  //   .gravity(0)
  //   .size([
  //     window.document.documentElement.clientWidth,
  //     window.document.documentElement.clientHeight
  //   ])
  //   .linkDistance(_linkDistance)
  //   .chargeDistance([10])
  //   .on('tick', _tick);

  const forceLayout = d3.forceSimulation()
    .force('link', d3.forceLink().distance(_linkDistance).strength(0.1))
    .on('tick', _tick as any);

  const fb1 = $ => {
    /*
      the d3.fishbone modifier, expecting to be called against an `svg:svg`
      or `svg:g` bound to the root node of a navigable tree, i.e.

        d3.select("body").append("svg")
          .datum({name: "foo", children: [{name: "bar"}]})
          .call(d3.fishbone());

      in addition to the properties created by `d3.layout.force`, this will
      add some or all of the following properties, none of which are
      guaranteed to be stable, useful, or sane:

      - depth       int
      - horizontal  bool
      - vertical    bool
      - root        bool
      - childIdx    int
      - maxChildIdx bool
      - totalLinks  [int]
      - linkCount   int
    */

    dataLinks = [];
    dataNodes = [];

    // populate the nodes and the links globals as a side effect
    _build_nodes($.datum());

    // set the nodes and the links of the force
    forceLayout
      .nodes(dataNodes)
      .force('link', d3.forceLink().links(dataLinks));

    // create the links
    link = $.selectAll('.link')
      .data(dataLinks);
    console.log(link);

    link.enter().append('line');

    // link
    //   .attr({
    //     class(d) {
    //       return 'link link-' + d.depth;
    //     },
    //     'marker-end'(d) {
    //       return d.arrow ? 'url(#' + arrowId() + ')' : null;
    //     }
    //   });

    link.exit().remove();

    // establish the node selection
    node = $.selectAll('.node').data(dataNodes);


    // actually create nodes
    node.enter().append('g')
      // .attr({
      //   class(d) {
      //     return 'node' + (d.root ? ' root' : '');
      //   }
      // })
      .append('text');

    node.select('text')
      // .attr({
      //   class(d) {
      //     return 'label-' + d.depth;
      //   },
      //   stroke(d) {
      //     if (d.color) {
      //       return d.color;
      //     }
      //   },
      //   'text-anchor'(d) {
      //     return !d.depth ? 'start' : d.horizontal ? 'end' : 'middle';
      //   },
      //   dy(d) {
      //     return d.horizontal ? '.35em' : d.region === 1 ? '1em' : '-.2em';
      //   }
      // })
      .text(label);

    node.exit().remove();

    // set up node events
    node
      // .call(forceLayout.drag)
      .on('mousedown', () => {
        d3.event.stopPropagation();
      });

    // select this so we know its width in tick
    root = $.select('.root').node();
  }; // fb1
  const color = d3.schemeCategory10;

  function _arrow($) {
    // creates an svg:defs and marker with an arrow if needed...
    // really just an example, as they aren't very flexible
    const defs = $.selectAll('defs').data([1]);

    defs.enter().append('defs');

    // create the arrows
    defs.selectAll('marker#' + arrowId())
      .data([1])
      .enter().append('marker')
      // .attr({
      //   id: arrowId(),
      //   viewBox: '0 -5 10 10',
      //   refX: 10,
      //   refY: 0,
      //   markerWidth: 10,
      //   markerHeight: 10,
      //   orient: 'auto'
      // })
      .append('path')
      .attr({d: 'M0,-5L10,0L0,5'});
  }

  function _build_nodes(currentNode) {
    /*
      this builds up the real/fake nodes and links needed
      - a node on the "spine" can be like:
        - o--->

            |
        - o-+->

            |
        - o-+->
            |

      - a node off a "rib" or "subrib" can be like:

        - o--->

            \
        - o--->

    */
    dataNodes.push(currentNode);

    let cx = 0;

    let between = [currentNode, currentNode.connector];
    const nodeLinks: any = [{
      source: currentNode,
      target: currentNode.connector,
      arrow: true,
      depth: currentNode.depth || 0
    }];
    let prev;
    let childLinkCount;

    if (!currentNode.parent) {
      dataNodes.push(prev = {tail: true});
      between = [prev, currentNode];
      nodeLinks[0].source = prev;
      nodeLinks[0].target = currentNode;
      currentNode.horizontal = true;
      currentNode.vertical = false;
      currentNode.depth = 0;
      currentNode.root = true;
      currentNode.totalLinks = [];
    } else {
      currentNode.connector.maxChildIdx = 0;
      currentNode.connector.totalLinks = [];
    }

    currentNode.linkCount = 1;

    (children(currentNode) || []).forEach((child, idx) => {
      child.parent = currentNode;
      child.depth = (currentNode.depth || 0) + 1;
      child.childIdx = idx;
      // tslint:disable-next-line:no-bitwise
      child.region = idx & 1 ? currentNode.region ? currentNode.region : 1 : currentNode.region ? currentNode.region : -1;
      child.horizontal = !currentNode.horizontal;
      child.vertical = !currentNode.vertical;

      if (currentNode.root && prev && !prev.tail) {
        dataNodes.push(child.connector = {
          between,
          childIdx: prev.childIdx
        });
        prev = null;
      } else {
        dataNodes.push(prev = child.connector = {between, childIdx: cx++});
      }

      nodeLinks.push({
        source: child,
        target: child.connector,
        depth: child.depth
      });

      // recurse capturing number of links created
      childLinkCount = _build_nodes(child);
      currentNode.linkCount += childLinkCount;
      between[1].totalLinks.push(childLinkCount);
    });

    between[1].maxChildIdx = cx;

    Array.prototype.unshift.apply(dataLinks, nodeLinks);

    // the number of links created byt this node and its children...
    // TODO: use `linkCount` and/instead of `childIdx` for spacing
    return currentNode.linkCount;
  }


  function _linePosition($) {
    // $.attr({
    //   x1(d) {
    //     return d.source.x;
    //   },
    //   y1(d) {
    //     return d.source.y;
    //   },
    //   x2(d) {
    //     return d.target.x;
    //   },
    //   y2(d) {
    //     return d.target.y;
    //   }
    // });
  }


  function _nodePosition($) {
    // uses an SVG `transform` to position nodes
    // $.attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');
  }


  function _linkDistance(d) {
    // make longer links for nodes with more children, or of lower depth
    return (d.target.maxChildIdx + 1) * linkScale(d.depth + 1);
  }


  function _tick() {
    /*
      the primary layout mechanism: a fair amount of the work is done
      by links, but override a lot of it here.

      TODO: enable tweaks to these individual rules
    */

    // this is a "little bit"
    const k = 6 * 1;
    let a;
    let b;

    dataNodes.forEach(d => {
      // handle the middle... could probably store the root width...
      if (d.root) {
        // d.x = width - (marginSize + d.root.getBBox().width);
      }
      if (d.tail) {
        d.x = marginSize;
        d.y = height / 2;
      }

      // put the first-generation items at the top and bottom
      if (d.depth === 1) {
        d.y = d.region === -1 ? marginSize : (height - marginSize);
        d.x -= 10 * k;
      }

      // vertically-oriented tend towards the top and bottom of the page
      if (d.vertical) {
        d.y += k * d.region;
      }

      // everything tends to the left
      if (d.depth) {
        d.x -= k;
      }

      // position synthetic nodes at evently-spaced intervals...
      // TODO: do something based on the calculated size of each branch
      // since we don't have individual links anymore
      if (d.between) {
        a = d.between[0];
        b = d.between[1];

        d.x = b.x - (1 + d.childIdx) * (b.x - a.x) / (b.maxChildIdx + 1);
        d.y = b.y - (1 + d.childIdx) * (b.y - a.y) / (b.maxChildIdx + 1);
      }

      perNodeTick(d);
    });

    // actually apply all changes
    node.call(_nodePosition);
    link.call(_linePosition);
  }

  // the d3.fishbone() public API
  // read-only
  fb1.links = () => dataLinks;
  fb1.nodes = () => dataNodes;
  fb1.force = () => forceLayout;
  fb1.defaultArrow = _arrow;
  fb1.margin = (_) => {
    // how big is the whitespace around the diagram?
    // if (!arguments.length) {
    //   return marginSize;
    // }
    marginSize = _;
    return my;
  };

  fb1.children = (_) => {
    // how  will children be sought from each node?
    // if (!arguments.length) {
    //   return children;
    // }
    children = _;
    return my;
  };

  fb1.label = (_) => {
    // how will a label be sought from each node?
    // if (!arguments.length) {
    //   return label;
    // }
    label = _;
    return my;
  };

  fb1._perNodeTick = (_) => {
    // what custom rules should be done per node?
    // if (!arguments.length) {
    //   return perNodeTick;
    // }
    perNodeTick = _;
    return my;
  };

  return fb1;
};

export default fishbone;
