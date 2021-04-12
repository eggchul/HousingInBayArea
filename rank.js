(function(){

//list out shared data
var table
var category = ["Best Cities to Live in America",
                "Best Suburbs to Live in san Francisco Bay Area"]
// set up svg size
var margin = {top: 30, right: 200, bottom: 70, left: 80},
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var svg = d3.select("#city-rank")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var div = d3.select("#city-rank-tool").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var z = d3.scaleOrdinal(d3.schemeCategory10);

// reference : https://www.d3-graph-gallery.com/graph/line_basic.html

d3.csv("city_rank.csv", function(d){
  if (d.category == category[1]){
    return d
  }
}).then((res)=> {
        table = res;

          // Add X axis
        var x = d3.scaleLinear()
                    .domain([0, Math.max(...table.map(x=>+x.rank)) + 2])
                    .range([ 0, width]);


        svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).tickSize(-height*1));

        // Add Y axis
        var y = d3.scaleBand()
                .domain(table.map(x=>x.name).reverse())
                .range([ height, 0]);


        svg.append("g")
            .call(d3.axisLeft(y).tickSize(-width*1));

        svg.selectAll(".tick line").attr("stroke", "lightgray")

        // Add X axis label:
        svg.append("text")
          // .attr("text-anchor", "end")
          .attr("x", 0)
          .attr("y", height + margin.top + 20)
          .text(category[1]);

        // Y axis label:
        svg.append("text")
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left + 20)
          .attr("x", -margin.top - height/4)
          .text("City")

        svg.append('g')
            .selectAll("dot")
            .data(table)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return x(+d.rank)} )
            .attr("cy", function (d) { return y(d.name)+y.bandwidth()/2 } )
            .attr("r", function (d) {
              return 5
            })
            .style("fill", function (d) {
              return z(d.name)
            })
            .style("opacity", 0.8)
            // .style("stroke", "white")
            .on("mouseover", function(event,d) {
               div.transition()
                 .duration(200)
                 .style("opacity", .9);
               div.html("City: " + d.name + "<br/>" + "Rank: " + d.rank )
                 .style("left", (event.pageX + 30) + "px")
                 .style("top", (event.pageY - 28) + "px");
               })
             .on("mouseout", function(d) {
               div.transition()
                 .duration(500)
                 .style("opacity", 0);
               });

        svg.append("text")
          .attr("text-anchor", "begin")
          .attr("x", width + 20)
          .attr("y", margin.top - 20)
          .text("Cities");

        svg.append('g')
            .selectAll("codeLegend")
            .data(table.map(x => x.name))
            .enter()
            .append("circle")
            .attr("cx", function (d) { return width + margin.left} )
            .attr("cy", function (d, i) { return margin.top + i * 25} )
            .attr("r", 10)
            .style("fill", function (d) {
              return z(d)
            })
            .style("opacity", 0.8)

        svg.append('g')
            .selectAll("text")
            .data(table.map(x => x.name))
            .enter()
            .append("text")
            .attr("fill", "black")
            .attr("font-size", "14px")
            .attr("y", function(d, i) { return margin.top + i * 25 + 5})
            .attr("x", function (d) { return width + margin.left + 5})
            .attr("dx", 5)
            .text(function(d){ return d})

    })

})();