function choose_settings() {
  var subreddit = document.getElementById("subreddit_input").value;
  var topic = document.getElementById("topic_input").value;
  var order = document.getElementById("heatmap_input").value;
    
  make_barchart(subreddit, topic);
}

function make_barchart(subreddit, topic) {
  var margin = {top: 40, right: 50, bottom: 50, left: 80},
      width = 800 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

  var x0 = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  var x1 = d3.scale.ordinal();

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x0)
      .tickSize(2)
      // .style("fill", "#555555")
      .tickPadding(10)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .tickSize(2)
      // .style("fill", "#555555")
      .tickPadding(10)
      .orient("left");

  var color = d3.scale.ordinal()
      .range([
        "#18994C", // green
        "#D87124", // orange
        "#961882", // purple
        "#CCC620", // yellow
        "#C7202C", // red
        "#166D7E", //  blue
        "#E8A2CD" //  pink
      ]);


  var tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#ffffff");

  d3.select("#bar_chart").select("svg").remove();

  var svg = d3.select('#bar_chart').append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("class", "svg_barchart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json("data/LIWC_json/"+topic+"/"+subreddit+".json", function(error, data) {

    var categoriesNames = data.map(function(d) { return d.YEAR; });
    var LIWCNames = data[0].values.map(function(d) { return d.LIWC; });

    x0.domain(categoriesNames);
    x1.domain(LIWCNames).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, d3.max(data, function(YEAR) { return d3.max(YEAR.values, function(d) { return d.value; }); })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .style('opacity','0')
        .call(yAxis)
    .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style('font-weight','bold')
        .text("average LIWC score");

    svg.select('.y').transition().duration(300).delay(600).style('opacity','1');

    var slice = svg.selectAll(".slice")
        .data(data)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform",function(d) { return "translate(" + x0(d.YEAR) + ",0)"; });

    slice.selectAll("rect")
        .data(function(d) { return d.values; })
        .enter().append("rect")
        .attr("width", x1.rangeBand())
        .attr("x", function(d) { return x1(d.LIWC); })
        .style("fill", function(d) { return color(d.LIWC) })
        .attr("y", function(d) { return y(0); })
        .attr("height", function(d) { return height - y(0); })
        .text(function(d) { return d.YEAR; })
        .on("mouseover", function(d){
          d3.select("#tooltip_heatmap")
           .style("left", (d3.event.pageX+10) + "px")
           .style("top", (d3.event.pageY-10) + "px")
           .text("subreddit: "+subreddit+", average LIWC: "+Math.round(d.value * 100) / 100+", category: "+d.LIWC);
          d3.select("#tooltip_heatmap").classed("hidden", false);
          d3.select(this).style("fill", d3.rgb(color(d.LIWC)).darker(2));
        })
        .on("mousemove", function(){
          tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
        })
        .on("mouseout", function(d){
          d3.select(this).classed("cell-hover",false);
          d3.select("#tooltip_heatmap").classed("hidden", true);
          d3.select(this).style("fill", color(d.LIWC));
        });
        
    slice.selectAll("rect")
        .transition()
        .delay(function (d) {return Math.random()*1000;})
        .duration(1000)
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });

    //Legend
    var legend = svg.selectAll(".legend")
        .data(data[0].values.map(function(d) { return d.LIWC; }).reverse())
    .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
        .style("opacity","0");

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return color(d); });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {return d; });

    legend.transition().duration(500).delay(function(d,i){ return 1300 + 100 * i; }).style("opacity","1");

  });
}