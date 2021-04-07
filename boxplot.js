

var airportCode = ['BOS','SFO','LAX','JFK','SEA']
var margin = {top: 30, right: 30, bottom: 70, left: 80},
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;



var table
var targetYear = '2015'
var dataMap = new Map()
var dataList = []
var tmpData
// reference: https://www.d3-graph-gallery.com/boxplot

d3.csv("https://corgis-edu.github.io/corgis/datasets/csv/airlines/airlines.csv")
    .then((res)=> {

        var div = d3.select("#bp-city").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        var svg = d3.select("#bp")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            table = res;
            for ( var i = 0; i < table.length; i ++) {
                var year = table[i]['Time.Year']
                var code = table[i]['Airport.Code']
                if ( year === targetYear && airportCode.includes(code)) {
                    var minute = Number(table[i]['Statistics.Minutes Delayed.Late Aircraft'])
                    dataMap[code] = dataMap[code] || []
                    dataMap[code].push(minute)
                }         
            }
        
        for (var i = 0; i < airportCode.length; i ++) {
            var arr = dataMap[airportCode[i]].sort(function(a, b) {
                return a - b
            });
            var tmp = {
                code: airportCode[i],
                q1: d3.quantile(arr, 0.25),
                q3: d3.quantile(arr, 0.75),
                median: d3.quantile(arr, 0.5),
                max : d3.max(arr),
                min : d3.min(arr),
            }
            dataList.push(tmp)
        }

        // Add X axis
        var x = d3.scaleBand()
                    .domain(airportCode)
                    .range([ 0, width])
                    .padding(0.5);


        svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
                .domain([0, 130000])
                .range([ height, 0]);
        
        svg.append("g")
            .call(d3.axisLeft(y).tickSize(-width*1.3).ticks(14));

        svg.selectAll(".tick line").attr("stroke", "lightgray");

        // Add X axis label:
        svg.append("text")
          .attr("text-anchor", "end")
          .attr("x", width )
          .attr("y", height + margin.top + 20)
          .text("Airport");

        // Y axis label:
        svg.append("text")
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left + 10)
          .attr("x", -margin.top - height/4)
          .text("Minutes Delayed Due To Late Aircraft")


        svg
            .selectAll("vertLines")
            .data(dataList)
            .enter()
            .append("line")
            .attr("x1", function(d){return(x(d.code) + x.bandwidth()/2)})
            .attr("x2", function(d){return(x(d.code) + x.bandwidth()/2)})
            .attr("y1", function(d){return(y(d.min))})
            .attr("y2", function(d){return(y(d.max))})
            .attr("stroke", "black")

        svg
            .selectAll("boxes")
            .data(dataList)
            .enter()
            .append("rect")
            .attr("x", function(d){return(x(d.code))})
            .attr("y", function(d){return(y(d.median))})
            .attr("height", function(d){return(y(d.q1)-y(d.median))})
            .attr("width", x.bandwidth() )
            .attr("stroke", "black")
            .style("fill", "#69b3a2")
            .on("mouseover", function(event,d) {
               div.transition()
                 .duration(200)
                 .style("opacity", .9);
               div.html("Q3 : " + d.q3  + "<br/> Median: " + d.median + "<br/> Q1: " + d.q1)
                 .style("left", (event.pageX) + "px")
                 .style("top", (event.pageY - 28) + "px");
               })
            .on("mouseout", function(d) {
               div.transition()
                 .duration(500)
                 .style("opacity", 0);
               });

        svg
            .selectAll("boxes")
            .data(dataList)
            .enter()
            .append("rect")
            .attr("x", function(d){return(x(d.code))})
            .attr("y", function(d){return(y(d.q3))})
            .attr("height", function(d){return(y(d.median)-y(d.q3))})
            .attr("width", x.bandwidth() )
            .attr("stroke", "black")
            .style("fill", "darkseagreen")
            .on("mouseover", function(event,d) {
               div.transition()
                 .duration(200)
                 .style("opacity", .9);
               div.html("Q3 : " + d.q3 + "<br/> Median: " + d.median + "<br/> Q1: " + d.q1)
                 .style("left", (event.pageX) + "px")
                 .style("top", (event.pageY - 28) + "px");
               })
            .on("mouseout", function(d) {
               div.transition()
                 .duration(500)
                 .style("opacity", 0);
               });

        // Show the median
        svg
            .selectAll("medianLines")
            .data(dataList)
            .enter()
            .append("line")
            .attr("x1", function(d){return(x(d.code))})
            .attr("x2", function(d){return(x(d.code) + x.bandwidth())})
            .attr("y1", function(d){return(y(d.median))})
            .attr("y2", function(d){return(y(d.median))})
            .attr("stroke", "black")
            .on("mouseover", function(event,d) {
               div.transition()
                 .duration(200)
                 .style("opacity", .9);
               div.html("Median: " + d.median)
                 .style("left", (event.pageX) + "px")
                 .style("top", (event.pageY - 28) + "px");
               })
             .on("mouseout", function(d) {
               div.transition()
                 .duration(500)
                 .style("opacity", 0);
               });
                // Show the median
        svg
            .selectAll("maxLines")
            .data(dataList)
            .enter()
            .append("line")
            .attr("x1", function(d){return(x(d.code))})
            .attr("x2", function(d){return(x(d.code) + x.bandwidth())})
            .attr("y1", function(d){return(y(d.max))})
            .attr("y2", function(d){return(y(d.max))})
            .attr("stroke", "black")
            .on("mouseover", function(event,d) {
               div.transition()
                 .duration(200)
                 .style("opacity", .9);
               div.html("Max: " + d.max)
                 .style("left", (event.pageX) + "px")
                 .style("top", (event.pageY - 28) + "px");
               })
             .on("mouseout", function(d) {
               div.transition()
                 .duration(500)
                 .style("opacity", 0);
               });

        svg
            .selectAll("minLines")
            .data(dataList)
            .enter()
            .append("line")
            .attr("x1", function(d){return(x(d.code))})
            .attr("x2", function(d){return(x(d.code) + x.bandwidth())})
            .attr("y1", function(d){return(y(d.min))})
            .attr("y2", function(d){return(y(d.min))})
            .attr("stroke", "black")
            .on("mouseover", function(event,d) {
               div.transition()
                 .duration(200)
                 .style("opacity", .9);
               div.html("Min: " + d.min)
                 .style("left", (event.pageX) + "px")
                 .style("top", (event.pageY - 28) + "px");
               })
             .on("mouseout", function(d) {
               div.transition()
                 .duration(500)
                 .style("opacity", 0);
               });

})

