      var width = 1300,
          height = 550,
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


      svg.append("defs").selectAll("marker")
        .data(["arrow"])
        .enter().append("marker")
        .attr("id", function(d) { return d; })
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");


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
<<<<<<< HEAD
          update(data)
          update_heatmap(data);
=======
          layerselect(data);
          // update_heatmap(data);
>>>>>>> master
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


<<<<<<< HEAD
            edges_initial = network.networks[2].weight_edges;
            edges_layer1 = network.networks[1].weight_edges;
            edges_layer2 = network.networks[0].weight_edges;
=======
>>>>>>> master


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

        update(layer1_nodes,layer1_edges);

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
          .style("stroke","black")
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


          // force.on("tick", function() {
          //   // make sure the nodes do not overlap the arrows
          //   link.attr("d", function(d) {
          //     // Total difference in x and y from source to target
          //     diffX = d.target.x - d.source.x;
          //     diffY = d.target.y - d.source.y;

          //     // Length of path from center of source node to center of target node
          //     pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY));

          //     // x and y distances from center to outside edge of target node
          //     offsetX = (diffX * d.target.radius) / pathLength;
          //     offsetY = (diffY * d.target.radius) / pathLength;

          //     return "M" + d.source.x + "," + d.source.y + "L" + (d.target.x - offsetX) + "," + (d.target.y - offsetY);
          //   });

          //   node.attr("transform", function(d) {
          //     return "translate(" + d.x + "," + d.y + ")";
          //   });
          // });

          // console.log(initial_edges);
          // // console.log(edges);

          // console.log(initial_nodes);
          // console.log(layer1_nodes);

          // update(data);

        function nodeOver(d) {
          force.stop();

          var el = this;
          d3.select(el).append("text").attr("class", "hoverLabel").attr("stroke", "red").attr("stroke-width", "5px")
            .style("opacity", .9)
            .style("pointer-events", "none")
            .text(d.id);

          d3.select(el).append("text").attr("class", "hoverLabel")
            .style("pointer-events", "none")
            .text(d.id);

          highlightEgoNetwork(d);
        }

        function nodeOut() {
          force.start();

          d3.selectAll("circle")
          .style("fill", "#CC9999");

          d3.selectAll("line")
          .style("stroke", "black")
          .style("stroke-width", "1px");
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

        


      }


      function zoomed() {
        console.log(d3.event)
        svg.style("stroke-width", 1.5 / d3.event.scale + "px");
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      } 
