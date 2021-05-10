(function(){

//list out shared data
var table
var category = ["Best Cities to Live in America",
                "Best Suburbs to Live in San Francisco Bay Area"]
// set up svg size
var margin = {top: 30, right: 160, bottom: 70, left: 90},
    width = 550 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

var svg = d3.select("#city-rank")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var div = d3.select("#city-rank-tool").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var hint = '<h4 style=" margin-top: 100px; margin-left:15px"><span style="background: -webkit-linear-gradient(red, blue); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-family: \'Dekko\';font-size: 24px;">You can hover on the points or labels for more information</span> <span>💡</span></h4>'

var textStyle = 'style="font-family: \'Lucida Sans Unicode\', \'Lucida Grande\', sans-serif;"'

var detail =  d3.select("#city-rank").append("div")
    .attr("class", "about")
    .html(`${hint}`);
    // .style("opacity", 0);

var z = d3.scaleOrdinal(d3.schemeCategory10);

// reference : https://www.d3-graph-gallery.com/graph/line_basic.html

// draw_rank(category[0])
draw_rank(category[1])

function draw_rank(rankType){
  d3.csv("city_rank.csv", function(d){
    if (d.category == rankType){
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
              .attr("class", "grid")
              .call(d3.axisLeft(y).tickSize(-width*1).tickFormat(""));

          svg.selectAll(".tick line").attr("stroke", "lightgray");

          svg.selectAll(".tick text").style("font-size", "16px");

          svg.append("g")
            .attr("id", "y-label")
            .style("font-size", "12px")
            .call(d3.axisLeft(y));

          // Add X axis label:
          svg.append("text")
            .style('fill', 'grey')
            .attr("x", -margin.left + 50)
            .attr("y", height + margin.top + 20)
            .text(table[0].category);

          svg.append("text")
            .attr("text-anchor", "begin")
            .attr("x", width + 20)
            .attr("y", height + 10)
            .text("Rank");

          // Y axis label:
          svg.append("text")
            .attr("text-anchor", "end")
            // .attr("transform", "rotate(-90)")
            .attr("y", margin.top - 40)
            .attr("x", margin.left - 100)
            .text("City")

          svg.append('g')
              .selectAll("dot")
              .data(table)
              .enter()
              .append("circle")
              .attr("cx", function (d) { return x(+d.rank)} )
              .attr("cy", function (d) { return y(d.name)+y.bandwidth()/2 } )
              .attr("r", function (d) {
                return 7
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
                 detail.transition()
                   .duration(200)
                   .style("opacity", .9);
                 detail.html(`<h4 ${textStyle}>${d.name}</h4> <h5 ${textStyle}> NO.${d.rank} </h5> <p ${textStyle}>${d.description}</p>`)
                 })
               .on("mouseout", function(d) {
                  div.transition()
                     .duration(500)
                     .style("opacity", 0);
                   out()
                 });

          svg.append('g')
              .selectAll("codeLegend")
              .data(table)
              .enter()
              .append("circle")
              .attr("cx", function (d) { return width + 30} )
              .attr("cy", function (d, i) { return margin.top + i * 25} )
              .attr("r", 10)
              .style("fill", function (d) {
                return z(d.name)
              })
              .style("opacity", 0.8)
              .on("mouseover", function(event,d) {
                detail.transition()
                  .duration(200)
                  .style("opacity", .9);
                detail.html(`<h4 ${textStyle}>${d.name}</h4> <h5 ${textStyle}> NO.${d.rank} </h5> <p ${textStyle}>${d.description}</p>`)
              })
              .on("mouseout", function(d) { out() });


          svg.append('g')
              .selectAll("text")
              .data(table)
              .enter()
              .append("text")
              .attr("fill", "black")
              .attr("font-size", "14px")
              .attr("y", function(d, i) { return margin.top + i * 25 + 5})
              .attr("x", function (d) { return width + 40})
              .attr("dx", 5)
              .text(function(d){ return d.name})
              .on("mouseover", function(event,d) {
                detail.transition()
                  .duration(200)
                  .style("opacity", .9);
                detail.html(`<h4 ${textStyle}>${d.name}</h4> <h5 ${textStyle}> NO.${d.rank} </h5> <p ${textStyle}>${d.description}</p>`)
              })
              .on("mouseout", function(d) {
                out()   
              });

          function out(){
            detail.transition()
                   .duration(1500)
                   .style("opacity", 0)
                   .on("end", function() {
                      detail.html(`${hint}`)
                            .transition()
                            .style('opacity', 1);
                   });
                   
          }
      }) 
}


})();