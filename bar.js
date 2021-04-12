(function(){

//list out shared data
var table
var area = ["san francisco-oakland-hayward, ca",
            "san jose-sunnyvale-santa clara, ca"]
var x, y


// set up svg size
var margin = {top: 100, right: 300, bottom: 500, left: 80},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

var svg = d3.select("#bar-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    // .style("background-color", 'lightyellow')
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var div = d3.select("#bar-chart-tool").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var cfg = {
  labelMargin: 15,
  xAxisMargin: 10,
  legendRightMargin: 0
};

draw_bar()
// reference : https://d3-legend.susielu.com/
// https://codepen.io/jchowe/pen/WLNXqB
function draw_bar(){
    d3.csv("./area_listing.csv", function(d) {
        if(d.area == area[0]){
            var tmp = d.time
            d.time = new Date(`${tmp[0]}${tmp[1]}${tmp[2]}${tmp[3]}-${tmp[4]}${tmp[5]}-28`)
            return d
        }
    })
    .then((res)=> {
        table = res
        var xTime = d3.scaleTime()
            .domain([new Date(d3.min(table.map(d=>d.time.getTime()))), new Date(d3.max(table.map(d=>d.time.getTime())))])
            .rangeRound([0, width])

        x = d3.scaleBand()
            .domain(d3.timeYear.range(...xTime.domain()))
            .rangeRound([margin.left, width - margin.right])
            .padding(0.1)

        // Add Y axis
        y = d3.scaleLinear()
                .domain(d3.extent(table, function(d) {return +d.new_listing_count_mm;}))
                .nice()
                .range([ height, 0]);


        // svg.selectAll("text")
        //     .data(table)
        //     .enter()   
        //     .append("text")
        //     .attr("fill", "black")
        //     .attr("font-size", "14px").attr("text-anchor", "middle")
        //     .attr("x", function(d){
        //         return x(d.time)
        //     })
        //     .attr("y", function(d){
        //       if (d.new_listing_count_mm > 0) {
        //         return y(d.new_listing_count_mm) - 20;
        //       }else {
        //         return y(d.new_listing_count_mm) + 20;
        //       }
        //     })
        //     .attr("dx", x.bandwidth()/2)
        //     .text(function(d){
        //         return d.new_listing_count_mm;
        //     });

        svg.append("g")
                .attr('name', 'x-axis')
                .attr("transform", "translate(0," + (y(0)) + ")")
                .append("line")
                .attr("x1", 0)
                .attr("x2", width)
                .call(d3.axisBottom(xTime).tickSizeOuter(0));

        svg.append("g")
            .call(d3.axisLeft(y).tickSize(-width*1).ticks(10));

        svg.selectAll(".tick line").attr("stroke", "lightgray")
        var labels = svg.append("g").attr("class", "labels");
        labels.selectAll("text")
          .data(table)
          .enter()
          .append("text")
          .attr("class", "bar-label")
          .attr("x", function(d) {return x(d.time);})
          .attr("y", y(0))
          .attr("dx", x.bandwidth()-20)
          .attr("dy", function(d) {return d.new_listing_count_mm < 0 ? - cfg.labelMargin :  cfg.labelMargin;})
          .attr("text-anchor", "end")
          .text(function(d) {return d.state;})
        // Add X axis label:
        svg.append("text")
          .attr("text-anchor", "end")
          .attr("x", width + margin.left - x.bandwidth())
          .attr("y", y(0) + 20)
          .text("Date");

        // // Y axis label:
        // svg.append("text")
        //   .attr("text-anchor", "end")
        //   .attr("transform", "rotate(-90)")
        //   .attr("y", -margin.left + 10)
        //   .attr("x", -margin.top - height/4)
        //   .text("Monthly % Change of New Listing")


        var extent = d3.extent(table, d => +d.new_listing_count_mm)

        //legend
        var colorScale = d3.scaleDiverging()
            .interpolator(d3.interpolateRdBu)
            // .domain([d3.min(table, d=> +d.new_listing_count_mm), 0 , d3.max(table, d=> +d.new_listing_count_mm)]).nice();
            .domain([extent[0], 0, extent[1]])

        var legend = d3.legendColor()
            .title("% Changed Comparing to Previous Month")
            .titleWidth(200)
            .scale(colorScale);



        svg.selectAll("rect")
            .data(table)
            .enter()
            .append("rect")
            .attr("x", function(d) {            
                return xTime(d.time)
            })
            .attr("y", function(d) {
                return Math.min(y(0),y(d.new_listing_count_mm));
            })
            .attr("width", x.bandwidth())
            .attr("height", function(d) {
                if(d.new_listing_count_mm > 0){
                  return y(0) - y(d.new_listing_count_mm)
                } else {
                  return y(d.new_listing_count_mm) - y(0)
                }
            })
            .attr("fill", function(d){
              return colorScale(d.new_listing_count_mm)
            })
            .style("stroke", 'lightgray')
            // .style("stroke", "white")
            .on("mouseover", function(event,d) {
               div.transition()
                 .duration(200)
                 .style("opacity", .9);
               div.html("% change: " + d.new_listing_count_mm + "<br/>" + "Time: " + d.time)
                 .style("left", (event.pageX + 30) + "px")
                 .style("top", (event.pageY - 28) + "px");
               })
             .on("mouseout", function(d) {
               div.transition()
                 .duration(500)
                 .style("opacity", 0);
               });



        svg.append("g")
            .attr("transform", "translate(" + (width + margin.left) + ",10)")
            .call(legend);
        })
}


})();