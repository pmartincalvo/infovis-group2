      var width = 3000,
          height = 2000,
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

      var graph_node_info = d3.select("body")
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
           
        initial_nodes.forEach(function(d) {
          d.layer = 0;
        });

        layer1_nodes.forEach(function(d) {
          d.layer = 1;
        });

        layer2_nodes.forEach(function(d) {
          d.layer = 2;
        });

        var myselect=document.getElementById("layer_select");
        var index=myselect.selectedIndex;
            // console.log(myselect.options[index].value);

          if(myselect.options[index].value == "initial_layer"){
            update(initial_nodes,initial_edges,0);
          }

          if(myselect.options[index].value == "layer1"){
            update(layer1_nodes,layer1_edges,1);
          }

          if(myselect.options[index].value == "layer2_weight"){
            update(layer2_nodes,layer2_weight_edges,2);
          }

          if(myselect.options[index].value == "layer2_sentiment"){
            update(layer2_nodes,layer2_sentiment_edges,2);
          }


        d3.select("#layer_select").on("change", function() {
          // console.log(this.value);

          if(this.value == "initial_layer"){
            update(initial_nodes,initial_edges,0);
          }

          if(this.value == "layer1"){
            update(layer1_nodes,layer1_edges,1);
          }

          if(this.value == "layer2_weight"){
            update(layer2_nodes,layer2_weight_edges,2);
          }

          if(this.value == "layer2_sentiment"){
            update(layer2_nodes,layer2_sentiment_edges,2);
          }

        });

        

      }


      function update(node,edge,layer){

        // console.log(layer);
        var charge_data = (layer+1)*-400; 
        // console.log(charge_data);

        if(force) force.stop();
        svg.selectAll('circle').remove();
        svg.selectAll('line').remove();

        var force = d3.layout.force()
              .nodes(node) //指定节点数组
              .links(edge) //指定连线数组
              .size([width,height]) //指定作用域范围
              .linkDistance(100) //指定连线长度
              .charge(charge_data); //相互之间的作用力
              force.start(); 

        // console.log(node[0]);

        // node[0].fx = width / 2;
        // node[0].fy = height/ 2;

        // console.log(node[0]);

        var a = d3.rgb(255,0,0);  //红色red
        var b = d3.rgb(0,255,0);  //绿色greed
         
        var compute = d3.interpolate(a,b);
        var linear = d3.scale.linear()
                      .domain([0,2])
                      .range([0,1]);


        var svg_edges = svg.selectAll("line")
          .data(edge)
          .enter()
          .append("line")
          .style("stroke",function(d){
            // console.log(d);
            if(d.mean_sentiment){
              // if(d.mean_sentiment >= 1)
              // return "yellow"
              return compute(linear(d.mean_sentiment+1));
            }
            else{
              return "#555555";
            }
          })
          .style("stroke-width",2);
            
        var size_max = [];
        node.forEach(function(d){
          size_max.push(d.size);

        });
        console.log(size_max);

        var maxSize = d3.max(size_max)

        var linear_node = d3.scale.linear()
                      .domain([1,maxSize])
                      .range([8,20]);

        //添加节点 
        var svg_nodes = svg.selectAll("circle")
          .data(node)
          .enter()
          .append("circle")
          .attr("r",function(d){
              return linear_node(d.size);
            })
          .style("fill","#FD8E3C")
          .attr("stroke", "black")
          .attr("stroke-width",3)
          .on("click", click)
          .on("mouseover", nodeOver)
          .on("mouseout", nodeOut)
          .call(force.drag());
            // .on("start",dragstarted)
            // .on("drag",dragged)
            // .on("end",dragended));  //使得节点能够拖动


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

          highlightEgoNetwork(d);
        }

        function nodeOut() {
          // force.start();

          d3.selectAll("circle")
          .style("fill", "#FD8E3C");

          d3.selectAll("line")
          .style("stroke", function(d){
            // console.log(d);
            if(d.mean_sentiment){
              // if(d.mean_sentiment >= 1)
              // return "yellow"
              return compute(linear(d.mean_sentiment+1));
            }
            else{
              return "#555555";
            }
          })
          .style("stroke-width", "2px");

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

          d3.selectAll("line")
          .style("stroke", "FFFFFF")
          .style("stroke-width", "0px");

          d3.selectAll("line").filter(function (p) {return filteredEdges.indexOf(p) > -1})
          .style("stroke", function(d){
            // console.log(d);
            if(d.mean_sentiment){
              // if(d.mean_sentiment >= 1)
              // return "yellow"
              return compute(linear(d.mean_sentiment+1));
            }
            else{
              return "#555555";
            }
          })
          .style("stroke-width", "4px");

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

        // console.log(d.id);

                  var coordinates = d3.mouse(this);

          d3.select("#graph_node_info")
            .select("#info")
            .text(tooltipText(d));

          d3.select("#graph_node_info").classed("hidden", false);

      

      }

      function tooltipText(d) {
        var a = 'Current Layer: ' + d.layer +', NodeId: ' + d.id ;
        var b = "";
        if(d.layer ==2){
              b += ', NodeName: ' + d.name ;
        };
        var c = ', NodeSize: ' + d.size;
        return  a+b+c;        
      }

      function zoomed() {
        // console.log(d3.event)
        svg.style("stroke-width", 1.5 / d3.event.scale + "px");
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      } 
