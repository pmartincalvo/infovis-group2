var margin = { top: 50, right: 0, bottom: 100, left: 100 },
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    gridSize = Math.floor(width / 18),
    legendElementWidth = gridSize,
    buckets = 3,
    colors = ['#005824','#1A693B','#347B53','#4F8D6B','#699F83','#83B09B','#9EC2B3','#B8D4CB','#D2E6E3','#EDF8FB','#FFFFFF','#F1EEF6','#E6D3E1','#DBB9CD','#D19EB9','#C684A4','#BB6990','#B14F7C','#A63467','#9B1A53','#91003F'];
    // colors = [ "#1a9850", "#66bd63", "#a6d96a", "#d9ef8b", "#ffffbf", "#fee08b", "#fdae61","#f46d43", "#d73027"];
   // colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]; // alternatively colorbrewer.YlGnBu[9]

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function update_heatmap(data){
  console.log(data)

  var edges = data.networks[0].sentiment_edges;
  var nodes = data.networks[0].nodes;

  origin_nodes = edges.map(function(value) {
    return value.origin_node_id;
  });
  destination_nodes = edges.map(function(value) {
    return value.destination_node_id
  })

  var origin_nodes_unique = origin_nodes.filter( onlyUnique ); 
  var destination_nodes_unique = destination_nodes.filter( onlyUnique ); 

  console.log(destination_nodes_unique)

  var colorScale = d3.scale.quantile()
      .domain([-1, 1, 0.2])
      .range(colors);

  d3.select("#chart").select("svg").remove();

  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var y_axis = svg.selectAll()
      .data(origin_nodes_unique)
      .enter().append("text")
      .text(function (d) { return d; })
      .attr("x", 0)
      .attr("y", function (d, i) { return i * gridSize; })
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + gridSize / 1.5 + ")");

  var x_axis = svg.selectAll()
      .data(destination_nodes_unique)
      .enter().append("text")
      .text(function(d) { return d; })
      .attr("x", function(d, i) { return i * gridSize; })
      .attr("y", 0)
      .style("text-anchor", "middle")
      .attr("transform", "translate(" + gridSize / 2 + ", -6)");

  var heatMap = svg.selectAll()
      .data(edges)
      .enter().append("rect")
      .attr("x", function(d, i) {
        return destination_nodes_unique.indexOf(d.destination_node_id) * gridSize; })
      .attr("y", function(d, i) { 
        return origin_nodes_unique.indexOf(d.origin_node_id) * gridSize; })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("class", "origin_node_id bordered")
      .attr("width", gridSize)
      .attr("height", gridSize)
      .style("fill", colors[0])
      .on("mouseover", function(d){
          //Update the tooltip position and value
          d3.select("#tooltip")
           .style("left", (d3.event.pageX+10) + "px")
           .style("top", (d3.event.pageY-10) + "px")
           .text("origin: "+d.origin_node_id+", destination: "+d.destination_node_id+", influence: "+d.mean_sentiment);  
          //Show the tooltip
          d3.select("#tooltip").classed("hidden", false);
      })
      .on("mouseout", function(){
          d3.select(this).classed("cell-hover",false);
          // d3.selectAll(".rowLabel").classed("text-highlight",false);
          // d3.selectAll(".colLabel").classed("text-highlight",false);
          d3.select("#tooltip").classed("hidden", true);
      });

  heatMap.transition().duration(1000)
      .style("fill", function(d) { return colorScale(d.mean_sentiment); });

  heatMap.append("title").text(function(d) { return d.mean_sentiment; });
      
  var legend = svg.selectAll(".legend")
      .data([0].concat(colorScale.quantiles()), function(d) { return d; })
      .enter().append("g")
      .attr("class", "legend");

  legend.append("rect")
    .attr("x", function(d, i) { return legendElementWidth * i; })
    .attr("y", height)
    .attr("width", legendElementWidth)
    .attr("height", gridSize / 2)
    .style("fill", function(d, i) { return colors[i]; });

  legend.append("text")
    .attr("class", "mono")
    .text(function(d) { return Math.round(d * 10) / 10; })
    .attr("x", function(d, i) { return legendElementWidth * i; })
    .attr("y", height + gridSize);
}