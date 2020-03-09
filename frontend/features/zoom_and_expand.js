var width = 1100,
          height = 500,
          root;

      // var force = d3.layout.force()
      //     .size([width, height])
      //     .on("tick", tick);

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



      d3.json("output_example.json", function(error, json) {
        if (error) throw error;

        network = json;        
        console.log(network);
        var layer0 = network.dendrogram[2];
        // console.log(layer0);
        edges_initial = network.networks[2].edges;
        // console.log(edges);
        nodes_initial = network.networks[2].nodes;
        // console.log(nodes);


        // update();

      var hash_lookup = [];
      // make it so we can lookup nodes in O(1):
      nodes_initial.forEach(function(d, i) {
        hash_lookup[d.id] = d;
      });
      // console.log(hash_lookup);


      edges_initial.forEach(function(d, i) {
        d.source = hash_lookup[d.origin_node_id];
        d.target = hash_lookup[d.destination_node_id];
      });
      // console.log(edges);

      var edges_new = [];
      edges_initial.forEach(function(e) {
        edges_new.push({
          source: e.source,
          target: e.target
        });
      });
      // console.log(edges_new);

      // update();
      // force
      //     .nodes(hash_lookup)
      //     .links(edges_new)
      //     .start();

    var force = d3.layout.force()
      .nodes(hash_lookup) //指定节点数组
      .links(edges_new) //指定连线数组
      .size([width,height]) //指定作用域范围
      .linkDistance(150) //指定连线长度
      .charge([-400]); //相互之间的作用力

      force.start(); 

      console.log(hash_lookup);
console.log(edges_new);


      var svg_edges = svg.selectAll("line")
        .data(edges_new)
        .enter()
        .append("line")
        .style("stroke","#ccc")
        .style("stroke-width",1);

      var color = d3.scale.category20();

      //添加节点 
      var svg_nodes = svg.selectAll("circle")
        .data(hash_lookup)
        .enter()
        .append("circle")
        .attr("r",10)
        .style("fill",function(d,i){
          return color(i);
      })
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

      });


      function zoomed() {
        console.log(d3.event)
        svg.style("stroke-width", 1.5 / d3.event.scale + "px");
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      } 
