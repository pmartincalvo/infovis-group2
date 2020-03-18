      var width = 900,
          height = 600,
          expand = {},
          layer,
          node_total = [],
          link_total = [],
          root,
          network;

      var svg = d3.select("#graph")
          .append("svg")
          .attr("width", width)
          .attr("height", height);

      var zoom = d3.behavior.zoom()
                .scaleExtent([1, 8])
                .on("zoom", zoomed); 

      var link = svg.selectAll(".link");
      var node = svg.selectAll(".node"); 

      var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden");


      svg
        // .call(zoom) // delete this line to disable free zooming
        .call(zoom.event);

      function askForClusters(){
        var payload = {
            datetime_interval_start: minDate,
            datetime_interval_end: maxDate,
            selected_subreddits: []
        };
        console.log(JSON.stringify(payload));

        fetch("http://0.0.0.0:5000/cluster/",
        {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        })
        .then(response=>response.json())
        .then(data=>{
          console.log(data)
          // update(data)
          update_heatmap(data);
          layerselect(data);
        })
      };


      function layerselect(data){

        var networks = data.networks,
            dendrogram = data.dendrogram;

            // console.log(dendrogram[1][12]);

        var initial_nodes = networks[2].nodes,
            layer1_nodes  = networks[1].nodes,
            layer2_nodes  = networks[0].nodes;

        var initial_edges = networks[2].weight_edges,
            layer1_edges  = networks[1].weight_edges,
            layer2_weight_edges    = networks[0].weight_edges,
            layer2_sentiment_edges = networks[0].sentiment_edges;

        initial_nodes.forEach(function(d) {
          d.layer = 0;
        });

        layer1_nodes.forEach(function(d) {
          d.layer = 1;
        });

        layer2_nodes.forEach(function(d) {
          d.layer = 2;
        });

        initial_edges.forEach(function(d, i) {
            d.source = initial_nodes[d.origin_node_id];
            d.target = initial_nodes[d.destination_node_id];
        });

        layer1_edges.forEach(function(d, i) {
          d.source = layer1_nodes[d.origin_node_id];
          d.target = layer1_nodes[d.destination_node_id];
        });

        layer2_weight_edges.forEach(function(d, i) {
          for (var i = layer2_nodes.length - 1; i >= 0; i--) {
            if(layer2_nodes[i].id == d.origin_node_id){
              d.source = layer2_nodes[i];
            }
          }

          for (var i = layer2_nodes.length - 1; i >= 0; i--) {
            if(layer2_nodes[i].id == d.destination_node_id){
              d.target = layer2_nodes[i];
            }
          } 
        });

        layer2_sentiment_edges.forEach(function(d, i) {
          for (var i = layer2_nodes.length - 1; i >= 0; i--) {
            if(layer2_nodes[i].id == d.origin_node_id){
              d.source = layer2_nodes[i];
            }
          }

          for (var i = layer2_nodes.length - 1; i >= 0; i--) {
            if(layer2_nodes[i].id == d.destination_node_id){
              d.target = layer2_nodes[i];
            }
          } 
        });


        var edges = [];
        initial_edges.forEach(function(e) {
          var sourceNode = initial_nodes.filter(function(n) {
              return n.id === e.origin_node_id;
            })[0],
            targetNode = initial_nodes.filter(function(n) {
              return n.id === e.destination_node_id;
            })[0];

          edges.push({
            source: sourceNode,
            target: targetNode,
          });
        });

        update(initial_nodes,initial_edges);

      }


      function update(node,edge){

        if(force) force.stop();
        svg.selectAll('circle').remove();
        svg.selectAll('line').remove();

        var force = d3.layout.force()
              .nodes(node) //指定节点数组
              .links(edge) //指定连线数组
              .size([width,height]) //指定作用域范围
              .linkDistance(150) //指定连线长度
              .charge([-200]); //相互之间的作用力

              force.start(); 


        var svg_edges = svg.selectAll("line")
          .data(edge)
          .enter()
          .append("line")
          .style("stroke",function(d){
            if(d.mean_sentiment){
              // if(d.mean_sentiment >= 1)
              return "yellow";
            }
            else{
              return "black";
            }
          })
          .style("stroke-width",1);

        //添加节点 
        var svg_nodes = svg.selectAll("circle")
          .data(node)
          .enter()
          .append("circle")
          .attr("r",10)
          .style("fill","#CC9999")
          .on("click", click)
          .on("mouseover", nodeOver)
          .on("mouseout", nodeOut)
          .call(force.drag);  //使得节点能够拖动


        force.on("tick", function(){  //对于每一个时间间隔
      
         //更新连线坐标
         svg_edges.attr("x1",function(d){ return d.source.x; })
            .attr("y1",function(d){ return d.source.y; })
            .attr("x2",function(d){ return d.target.x; })
            .attr("y2",function(d){ return d.target.y; });
         
         //更新节点坐标
         svg_nodes.attr("cx",function(d){ return d.x; })
            .attr("cy",function(d){ return d.y; }); 


          });


        function nodeOver(d) {
          force.stop();
          // console.log(this);
          // d3.select(el).append("text").attr("class", "hoverLabel").attr("stroke","blue").attr("stroke-width", "5px")
          //   .style("opacity", .9)
          //   .style("pointer-events", "none")
          //   .text(d.id);

          highlightEgoNetwork(d);
        }

        function nodeOut() {
          force.start();

          d3.selectAll("circle")
          .style("fill", "#CC9999");

          d3.selectAll("line")
          .style("stroke", "black")
          .style("stroke-width", "1px");

          // d3.select("#tooltip").classed("hidden", true);
        }


        function highlightEgoNetwork(d) {
          var egoIDs = [];
          var filteredEdges = edge.filter(function (p) {return p.source == d || p.target == d});

          filteredEdges
          .forEach(function (p) {
            if (p.source == d) {
              egoIDs.push(p.target.id)
            }
            else {
              egoIDs.push(p.source.id)
            }
          });

          d3.selectAll("line").filter(function (p) {return filteredEdges.indexOf(p) > -1})
          .style("stroke", "red")
          .style("stroke-width", "3px");

          d3.selectAll("circle").filter(function (p) {return egoIDs.indexOf(p.id) > -1})
          .style("fill", "#66CCCC");
        }

      }


      function tick() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
      }

      function click(d) {

        console.log(d.id);

                  var coordinates = d3.mouse(this);

          d3.select("#tooltip")
            .select("#info")
            .text(tooltipText(d));

          d3.select("#tooltip").classed("hidden", false);

      

      }

      function tooltipText(d) {
        var linking = [],
            children = [];

        // if(d.layer = 0){
          
        // }

        // if(d.layer = 1){
   
        // }

        // if(d.layer = 2){
          
        // }


        return 'Current Layer: ' + d.layer +', NodeId: ' + d.id + ', Nodes link to current node: ' + "test1" + ', Nodes inside current node: ' + "test2";
      }


      function zoomed() {
        console.log(d3.event)
        svg.style("stroke-width", 1.5 / d3.event.scale + "px");
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      } 
