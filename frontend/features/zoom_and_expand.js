var width = 960,
  height = 500,
  root;

var force = d3.layout.force()
  .size([width, height])
  .on("tick", tick);

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

var zoom = d3.behavior.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);  

var link = svg.selectAll(".link"),
  node = svg.selectAll(".node");

svg
// .call(zoom) // delete this line to disable free zooming
.call(zoom.event);

d3.json("readme.json", function(error, json) {
if (error) throw error;

root = json;
update();
});

function update() {
var nodes = flatten(root),
    links = d3.layout.tree().links(nodes);

// Restart the force layout.
force
    .nodes(nodes)
    .links(links)
    .start();

// Update the links…
link = link.data(links, function(d) { return d.target.id; });

// Exit any old links.
link.exit().remove();

// Enter any new links.
link.enter().insert("line", ".node")
    .attr("class", "link")
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

// Update the nodes…
node = node.data(nodes, function(d) { return d.id; }).style("fill", color);

// Exit any old nodes.
node.exit().remove();

// Enter any new nodes.
node.enter().append("circle")
    .attr("class", "node")
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", function(d) { return Math.sqrt(d.size) / 10 || 4.5; })
    .style("fill", color)
    .on("click", click)
    .call(force.drag);
}

function tick() {
link.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

node.attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
}

// Color leaf nodes orange, and packages white or blue.
function color(d) {
return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}

// Toggle children on click.
function click(d) {
var bbox = this.getBBox(),
    bounds = [[bbox.x, bbox.y],[bbox.x + bbox.width, bbox.y + bbox.height]];
    console.log(bounds);
    // var dx = bounds[1][0] - bounds[0][0],
    // dy = bounds[1][1] - bounds[0][1],
    // x = (bounds[0][0] + bounds[1][0]) / 2,
    // y = (bounds[0][1] + bounds[1][1]) / 2,
    // scale = Math.max(1, Math.min(3, 0.9 / Math.max(dx / width, dy / height))),
    // translate = [width / 2 , height / 2 ];

if (!d3.event.defaultPrevented) {
  if (d.children) {
    d._children = d.children;
    d.children = null;

  } else {
    d.children = d._children;
    d._children = null;
    console.log(d3.select(this).attr("cx"));
    console.log(d3.select(this).attr("cy"));
    // svg.transition()
    //     .duration(750)
    //     .call(zoom.translate(translate).scale(2).event);
  }
  update();
}
}

// Returns a list of all nodes under the root.
function flatten(root) {
var nodes = [], i = 0;

function recurse(node) {
  if (node.children) node.children.forEach(recurse);
  if (!node.id) node.id = ++i;
  nodes.push(node);
}

recurse(root);
return nodes;
}

function zoomed() {
console.log(d3.event)
svg.style("stroke-width", 1.5 / d3.event.scale + "px");
svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
} 