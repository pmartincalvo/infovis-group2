

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
          layerselect(data);
          // update_heatmap(data);
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

// // *******************************************************
//       function update(data){
//         var nodes = json.nodes.filter(function(d) {
//           return d.collapsing == 0;
//         });

//         var links = edges.filter(function(d) {
//           return d.source.collapsing == 0 && d.target.collapsing == 0;
//         });

//         force
//           .nodes(nodes)
//           .links(links)
//           .start();

//         link = link.data(links)

//         link.exit().remove();

//         link.enter().append("path")
//           .attr("class", "link")
//           .attr("marker-end", "url(#end)");

//         node = node.data(nodes);

//         node.exit().remove();

//         node.enter().append("g")
//           .attr("class", function(d) {
//             return "node " + d.type
//           });

//         node.append("circle")
//           .attr("class", "circle")
//           .attr("r", function(d) {
//             d.radius = 30;
//             return d.radius
//           }); // return a radius for path to use 

//         node.append("text")
//           .attr("x", 0)
//           .attr("dy", ".35em")
//           .attr("text-anchor", "middle")
//           .attr("class", "text")
//           .text(function(d) {
//             return d.type
//           });

//         // On node hover, examine the links to see if their
//         // source or target properties match the hovered node.
//         node.on('mouseover', function(d) {
//           link.attr('class', function(l) {
//             if (d === l.source || d === l.target)
//               return "link active";
//             else
//               return "link inactive";
//           });
//         });

//         // Set the stroke width back to normal when mouse leaves the node.
//         node.on('mouseout', function() {
//           link.attr('class', "link");
//         })
//         .on('click', click);

//         function click(d) {
//           if (!d3.event.defaultPrevented) {
//             var inc = d.collapsed ? -1 : 1;
//             recurse(d);

//             function recurse(sourceNode){
//               //check if link is from this node, and if so, collapse
//               edges.forEach(function(l) {
//                 if (l.source.id === sourceNode.id){
//                   l.target.collapsing += inc;
//                   recurse(l.target);
//                 }
//               });
//             }
//             d.collapsed = !d.collapsed;
//           }      
//           update();
//         }
//       };
         


// *******************************************************


       // layer1_nodes.forEach(function(d){
        //   d.group = dendrogram[1][d.id];
        // })

        // layer2_nodes.forEach(function(d){
        //   d.group = 2;
        // })



   

        //     // console.log(dendrogram[1][12]);

  



      // ************** duandian2
      //   if (force) force.stop();
      //   svg.selectAll('.node').remove();
      //   svg.selectAll('.link').remove();

      //   var layer0 = network.dendrogram[2].layer0;      
      //       layer1 = network.dendrogram[1].layer1;
      //       layer2 = network.dendrogram[0].layer2;

      //   var nodes_initial = network.networks[2].nodes;
      //       nodes_layer1  = network.networks[1].nodes;
      //       nodes_layer2  = network.networks[0].nodes;

      //       edges_initial = network.networks[2].edges;
      //       edges_layer1 = network.networks[1].edges;
      //       edges_layer2 = network.networks[0].edges;

      //   console.log(nodes_initial);

      //   edges_initial.forEach(function(d, i) {
      //       d.source = nodes_initial[d.origin_node_id];
      //       d.target = nodes_initial[d.destination_node_id];
      //   });

      //   edges_layer1.forEach(function(d, i) {
      //     d.source = nodes_layer1[d.origin_node_id];
      //     d.target = nodes_layer1[d.destination_node_id];
      //   });

      //   edges_layer2.forEach(function(d, i) {
      //     d.source = nodes_layer2[d.origin_node_id];
      //     d.target = nodes_layer2[d.destination_node_id];
      //   });

      //   console.log(edges_initial);
  
      //   link = link.data(edges_initial, function(d) { return d.target.id; });

      //   // Exit any old links.
      //   // link.exit().remove();

      //   // Enter any new links.
      //   link.enter().insert("line", ".node")
      //       .attr('name', function(d) { return d.id; })
      //       .attr("class", "link")
      //       .attr("x1"  ,  function(d) { return d.source.x; })
      //       .attr("y1"  ,  function(d) { return d.source.y; })
      //       .attr("x2"  ,  function(d) { return d.target.x; })
      //       .attr("y2"  ,  function(d) { return d.target.y; });

      //   // Update the nodes…
      //   node = node.data(nodes_initial, function(d) { return d.id; }).style("fill", "#666666");

      //   // Exit any old nodes.
      //   // node.exit().remove();

      //   // Enter any new nodes.
      //   node.enter().append("circle")
      //       .attr("class", "node")
      //       .attr("cx", function(d) { return d.x; })
      //       .attr("cy", function(d) { return d.y; })
      //       .attr("r",  8)
      //       .style("fill", color)
      //       .on("dblclick", click)
      //       .on("mouseover",function(d,i){
      //         d3.select(this)
      //           .style("fill","blue");
      //         })
      //       .on("mouseout",function(d,i){
      //         d3.select(this)
      //           .style("fill",color);
      //         })
      //       .call(force.drag);

      //   force
      //     .nodes(nodes_initial)
      //     .links(edges_initial)
      //     .theta(0.5)
      //     .charge([-100])
      //     .linkDistance(150)
      //     .on("tick", tick)
      //     .start();
      //   }

        // function click(d) {

        //   console.log(d.id);

          // if (force) force.stop();
          // svg.selectAll('.node').remove();
          // svg.selectAll('.link').remove();
          
          // var node_new = [];

          // for (var i = layer1.length - 1; i >= 0; i--) {
          //   if(d.id == layer1[i].source)
          //     {
          //       node_new.push({
          //         id: layer1[i].nodeid,
          //         layer: 1
          //       });
          //     }
          // }

      //     var link_new = [];

      //     for (var i = node_new.length - 1; i >= 0; i--) {
      //       for (var j = edges_layer1.length - 1; j >= 0; j--) {
      //         if(node_new[i].id == edges_layer1[j].origin_node_id){
      //           link_new.push({
      //             origin_node_id: edges_layer1[j].origin_node_id,
      //             destination_node_id: edges_layer1[j].destination_node_id
      //             // source: edges_layer1[j].source,
      //             // target: edges_layer1[j].target
      //           });
      //           if(edges_layer1[j].destination_node_id in node_new){}
      //             else{
      //               node_new.push({
      //               id: edges_layer1[j].destination_node_id,
      //               layer: 1
      //               });  
      //             }
      //         }
      //         if(node_new[i].id == edges_layer1[j].destination_node_id){
      //           link_new.push({
      //             origin_node_id: edges_layer1[j].origin_node_id,
      //             destination_node_id: edges_layer1[j].destination_node_id
      //             // source: edges_layer1[j].source,
      //             // target: edges_layer1[j].target,
      //           });    
      //           if(edges_layer1[j].origin_node_id in node_new){}
      //             else{
      //               node_new.push({
      //                 id: edges_layer1[j].origin_node_id,
      //                 layer: 1
      //               });  
      //             }
      //         }
      //       }
      //     }
      //     console.log(link_new);
      //     console.log(node_new);  
      //     // console.log(node_new[17]);

      //     var edges_final = new Array();
      //     for (var i = link_new.length - 1; i >= 0; i--) {
            
      //       var sourceNode = {};
      //       var targetNode = {};

      //       for (var j = node_new.length - 1; j >= 0; j--) {
      //         if(link_new[i].origin_node_id == node_new[j].id){
      //           sourceNode = node_new[j];
      //         }
      //       }

      //       for (var j = node_new.length - 1; j >= 0; j--) {
      //         if(link_new[i].destination_node_id == node_new[j].id){
      //           targetNode = node_new[j];
      //         }
      //       }

      //       if(sourceNode.id && targetNode.id){

      //       edges_final.push({
      //         source: sourceNode,
      //         target: targetNode
      //       });
      //       }
      //     }

      //     console.log(edges_final[17]);

      //     link = link.data(edges_final, function(d) { return d.target.id; });

      //     // // Enter any new links.
      //     link.enter().insert("line", ".node")
      //         .attr('name', function(d) { return d.id; })
      //         .attr("class", "link")
      //         .attr("x1"  ,  function(d) { return d.source.x; })
      //         .attr("y1"  ,  function(d) { return d.source.y; })
      //         .attr("x2"  ,  function(d) { return d.target.x; })
      //         .attr("y2"  ,  function(d) { return d.target.y; });

      //     // Update the nodes…
      //     node = node.data(node_new, function(d) { return d.id; }).style("fill", "#666666");

      //     // Enter any new nodes.
      //     node.enter().append("circle")
      //         .attr("class", "node")
      //         .attr("cx", function(d) { return d.x; })
      //         .attr("cy", function(d) { return d.y; })
      //         .attr("r",  8)
      //         .style("fill", color)
      //         .on("mouseover",function(d,i){
      //           d3.select(this)
      //             .style("fill","blue");
      //           })
      //         .on("mouseout",function(d,i){
      //           d3.select(this)
      //             .style("fill",color);
      //           })
      //         .on("click",function(d){console.log(d)})
      //         .call(force.drag);

      //     force
      //       .nodes(node_new)
      //       .links(edges_final)
      //       .theta(0.5)
      //       .charge([-100])
      //       .linkDistance(150)
      //       .on("tick", tick)
      //       .start();

      //     // var force_new = d3.layout.force()
      //     //       .nodes(node_new) //指定节点数组
      //     //       .links(edges_final) //指定连线数组
      //     //       .size([width,height]) //指定作用域范围
      //     //       .linkDistance(150) //指定连线长度
      //     //       .charge([-400]); 

      //     //     force_new.start();



      //    //  var svg_edges = svg.selectAll("line")
      //    //    .data(edges_final)
      //    //    .enter()
      //    //    .append("line")
      //    //    .style("stroke","#ccc")
      //    //    .style("stroke-width",1);
         
      //    //  var color = d3.scale.category20();
         
      //    // //添加节点 
      //    //  var svg_nodes = svg.selectAll("circle")
      //    //    .data(node_new)
      //    //    .enter()
      //    //    .append("circle")
      //    //    .attr("r",20)
      //    //    .style("fill",function(d,i){
      //    //      return color(i);
      //    //    })
      //    //    .call(force.drag);  //使得节点能够拖动

      //   }

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
