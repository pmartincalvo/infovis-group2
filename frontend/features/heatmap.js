var margin = { 
      top: 100, 
      right: 50, 
      bottom: 50, 
      left: 150 
    },
    gridSize = 40,
    col_number=60;
    row_number=50;
    width = gridSize*col_number, // - margin.left - margin.right,
    height = gridSize*row_number , // - margin.top - margin.bottom,
    legendElementWidth = gridSize,
    buckets = 3,
    colors = ['#91003F', '#9B1A53', '#A63467', '#B14F7C', '#BB6990', '#C684A4', '#D19EB9', '#DBB9CD', '#E6D3E1', '#F1EEF6', '#FFFFFF', '#EDF8FB', '#D2E6E3', '#B8D4CB', '#9EC2B3', '#83B09B', '#699F83', '#4F8D6B', '#347B53', '#1A693B', '#005824'];
    // colors = [ "#1a9850", "#66bd63", "#a6d96a", "#d9ef8b", "#ffffbf", "#fee08b", "#fdae61","#f46d43", "#d73027"];
   // colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]; // alternatively colorbrewer.YlGnBu[9]

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function update_heatmap(data){

  var network = data.networks[0];
  var edges = data.networks[0].sentiment_edges;
  var nodes = data.networks[0].nodes;

  var edges_array=[];
  for(a in edges){
    edges_array.push([edges[a].origin_node_id, edges[a].destination_node_id ,edges[a].weight, edges[a].mean_sentiment])
  }

  origin_nodes = edges.map(function(value) {
    return value.origin_node_id;
  });
  var origin_nodes_unique = origin_nodes.filter( onlyUnique );
  destination_nodes = edges.map(function(value) {
    return value.destination_node_id
  })
  var destination_nodes_unique = destination_nodes.filter( onlyUnique );

  // initial order of subreddits on axes
  var x_order = destination_nodes_unique;
  var y_order = origin_nodes_unique;

  var colorScale = d3.scale.quantile()
      .domain([-1, 1, 0.2])
      .range(colors);

  d3.select("#heatmap").select("svg").remove();

  var svg = d3.select("#heatmap").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var rowLabels = svg.selectAll()
      .data(nodes)
      .enter().append("text")
      .text(function (d) { 
        return d.name; })
      .attr("x", 0)
      .attr("y", function(d, i) {
        var index = $.inArray(d.id, y_order);
        if (index >= 0){
          return index * gridSize;
        }else{
          return height + gridSize;
        }
      })
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
      .attr("class", function (d,i) { return "rowLabel mono r"+i;} );
      // .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
      // .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);});

  var colLabels = svg.selectAll()
      .data(nodes)
      .enter().append("text")
      .text(function(d) { 
        return d.name; })
      .attr("y", function(d, i) {
        var index = $.inArray(d.id, x_order);
        if (index >= 0){
          return index * gridSize;
        }else{
          return width + gridSize;
        }
      })
      .attr("x", 0)
      .style("text-anchor", "left")
      .attr("transform", "translate("+gridSize/2 + ", -6) rotate (-90)")
      .attr("class",  function (d,i) { return "colLabel mono c"+i;} );
      // .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
      // .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);});

  var heatMap = svg.selectAll()
      .data(edges)
      .enter().append("rect")
      .attr("x", function(d, i) {
        return x_order.indexOf(d.destination_node_id) * gridSize; })
      .attr("y", function(d, i) { 
        return y_order.indexOf(d.origin_node_id) * gridSize; })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("class", "node bordered")
      .attr("width", gridSize)
      .attr("height", gridSize)
      .style("fill", colors[0])
      .on("mouseover", function(d){
          d3.select(this).classed("cell-hover",true);
          d3.selectAll(".rowLabel").classed("text-highlight",function(r,ri){ return ri==(d.row-1);});
          d3.selectAll(".colLabel").classed("text-highlight",function(c,ci){ return ci==(d.col-1);});
          //Update the tooltip_heatmap position and value
          d3.select("#tooltip_heatmap")
           .style("left", (d3.event.pageX+10) + "px")
           .style("top", (d3.event.pageY-10) + "px")
           .text("origin: "+d.source.name+", destination: "+d.target.name+", weight: "+d.weight+", sentiment: "+Math.round(d.mean_sentiment * 100) / 100);  
          //Show the tooltip_heatmap
          d3.select("#tooltip_heatmap").classed("hidden", false);
      })
      .on("mouseout", function(){
          d3.select(this).classed("cell-hover",false);
          // d3.selectAll(".rowLabel").classed("text-highlight",false);
          // d3.selectAll(".colLabel").classed("text-highlight",false);
          d3.select("#tooltip_heatmap").classed("hidden", true);
      });

  heatMap.transition().duration(1000)
      .style("fill", function(d) { return colorScale(d.mean_sentiment); });

  heatMap.append("title").text(function(d) { return d.mean_sentiment; });
      
  // var legend = svg.selectAll(".legend")
  //     .data([0].concat(colorScale.quantiles()), function(d) { return d; })
  //     .enter().append("g")
  //     .attr("class", "legend");

  // legend.append("rect")
  //   .attr("x", function(d, i) { return legendElementWidth * i; })
  //   .attr("y", height)
  //   .attr("width", legendElementWidth)
  //   .attr("height", gridSize / 2)
  //   .style("fill", function(d, i) { return colors[i]; });

  // legend.append("text")
  //   .attr("class", "mono")
  //   .text(function(d) { return Math.round(d * 10) / 10; })
  //   .attr("x", function(d, i) { return legendElementWidth * i; })
  //   .attr("y", height + gridSize);


  function double_sort(a, b) {
    var o1 = a[3];
    var o2 = b[3];

    var p1 = a[2];
    var p2 = b[2];

    if (o1 < o2) return -1;
    if (o1 > o2) return 1;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
    return 0;
  }

  d3.select("#heatmap_input").on("change",function(){
    order(this.value);
  });

  // sorting
  function order(value, subreddit){
    var t = svg.transition().duration(2000);

    // order of the clustering output, of origin en destination nodes, in sentiment_edges
    if(value=="original_order"){
      // restore initial order of subreddits on axes
      var x_order = destination_nodes_unique;
      var y_order = origin_nodes_unique;

    }else if (value=="negative"){
      edges_array.sort(function(a,b){
        return double_sort(a, b)});

      var y_order = edges_array.map(function(value) {
        return value[0];
      });
      var x_order = edges_array.map(function(value) {
        return value[1];
      });

      var y_order = y_order.filter( onlyUnique );
      var x_order = x_order.filter( onlyUnique );
    
    }else if (value=="subreddits"){
      var nodes_array=[];
      for(a in edges){
        nodes_array.push([nodes[a].id, nodes[a].name])
      }

      console.log(subreddit);

      var filtered = edges_array.filter(function(x) { return x[4]==subreddit; });
      console.log(filtered);
    
    }else if (value=="weights"){
      edges_array.sort(function(a,b){return b[2] - a[2]});

      var y_order = edges_array.map(function(value) {
        return value[0];
      });
      var x_order = edges_array.map(function(value) {
        return value[1];
      });

      var y_order = y_order.filter( onlyUnique );
      var x_order = x_order.filter( onlyUnique );

    }

    t.selectAll(".node")
      .attr("x", function(d) { return x_order.indexOf(d.destination_node_id) * gridSize; })
      .attr("y", function(d) { return y_order.indexOf(d.origin_node_id) * gridSize; });

    t.selectAll(".rowLabel")
      .attr("y", function(d, i) {
        var index = $.inArray(d.id, y_order);
        if (index >= 0){
          return index * gridSize;
        }else{
          return height + gridSize;
        }
      });

    t.selectAll(".colLabel")
      .attr("y", function(d, i) {
        var index = $.inArray(d.id, x_order);
        if (index >= 0){
          return index * gridSize;
        }else{
          return width + gridSize;
        }
      });
  }

}
