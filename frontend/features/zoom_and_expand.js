
var width = 1100,
  height = 700,
  expand = {},
  layer,
  root;

var curve = d3.svg.line()
  .interpolate("cardinal-closed")
  .tension(.85);

var fill = d3.scale.category20();


function getGroup(n) { 
  return n.group; 
}


// var force = d3.layout.force()
//     .size([width, height])
//     .on("tick", tick);

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

var force = d3.layout.force()
  .size([width, height])
  .on("tick", tick);

var zoom = d3.behavior.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);  

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

svg
// .call(zoom) // delete this line to disable free zooming
  .call(zoom.event);



d3.json("../data/output_example.json", function(error, json) {
  if (error) throw error;

  network = json;        
  console.log(network);
  update()
});

function update(){

var layer0 = network.dendrogram[2];      
    layer1 = network.dendrogram[1];
    layer2 = network.dendrogram[0];

var nodes_initial = network.networks[2].nodes;
    edges_initial = network.networks[2].edges;

var hash_lookup_initial = [];
nodes_initial.forEach(function(d) {
  hash_lookup_initial[d.id] = d;
});

edges_initial.forEach(function(d, i) {
  d.source = hash_lookup_initial[d.origin_node_id];
  d.target = hash_lookup_initial[d.destination_node_id];
});

var edges_new_initial = [];
edges_initial.forEach(function(e) {
  edges_new_initial.push({
    source: e.source,
    target: e.target
  });
});


// var nodes = node_select(root),
//     edges = edges_select(nodes);

force
.nodes(hash_lookup_initial)
.links(edges_new_initial)
.start();



link = link.data(edges_new_initial, function(d) { return d.target.id; });

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
node = node.data(hash_lookup_initial, function(d) { return d.id; }).style("fill", color);

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
    .on("mouseover",function(d,i){
      d3.select(this)
        .style("fill","blue");
      })
    .on("mouseout",function(d,i){
      d3.select(this)
        .style("fill",color);
      })
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

function color(d) {
  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}

function click(d) {
  
}


// function node_select(root) {
//   var nodes = [], i = 0;
  
//   function recurse(node) {
//     if (d.id in layer1) d.id.forEach(d);
//     if (!node.id) node.id = ++i;
//     nodes.push(node);
//   }

//   recurse(root);
//   return nodes;
// }

function zoomed() {
  console.log(d3.event)
  svg.style("stroke-width", 1.5 / d3.event.scale + "px");
  svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
} 


