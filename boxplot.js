(function(){
var margin = {top: 30, right: 30, bottom: 70, left: 80},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
var months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
var area = ["san francisco-oakland-hayward, ca",
            "san jose-sunnyvale-santa clara, ca"]

var div = d3.select("#bp-city").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
var svg = d3.select("#bp")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var colorMap = {
  'san francisco-oakland-hayward, ca':"#578dff",
  'san jose-sunnyvale-santa clara, ca': "#f72830",
}


var promises = [
  d3.csv("./area_listing.csv", function(d) {
       
            var tmp = d.time
            var check = `${tmp[0]}${tmp[1]}${tmp[2]}${tmp[3]}-${tmp[4]}${tmp[5]}`
            if(check === '2021-03'){
                return
            }
            const obj = {
                area : d.area,
                time : `${tmp[0]}${tmp[1]}${tmp[2]}${tmp[3]}-${tmp[4]}${tmp[5]}`,
                ratio : +d.pending_ratio_mm
            }
            return obj
        
    }),
  d3.csv("./bitcoin.csv")
]

Promise.all(promises).then(ready)


function ready([listing, bitcoin]) {

    // draw box plot

        var table = bitcoin;
        var dataMap = new Map()
        var dataList = []

        for (var i = 0; i < table.length; i++) {
            var dateObject = new Date(table[i].Date);
            var year = dateObject.getFullYear();
            var month = dateObject.getMonth() + 1;
            var time
            if (month < 10){
                time = `${year}-0${month}`
            } else {
                time = `${year}-${month}`
            }
            
            var dailyChange = Number(table[i]['daily-change'])
            if(!dataMap.has(time)){
                  dataMap.set(time,[])  
            }
            var tmp = dataMap.get(time)
            tmp.push(dailyChange) 
            dataMap.set(time,tmp) 
        }
        for (let [key, value] of dataMap) {
            var arr = value.sort(function(a, b) {
                return a - b
            });
            var tmp = {
                time: key,
                q1: d3.quantile(arr, 0.25).toFixed(2),
                q3: d3.quantile(arr, 0.75).toFixed(2),
                median: d3.quantile(arr, 0.5).toFixed(2),
                max : d3.max(arr).toFixed(2),
                min : d3.min(arr).toFixed(2),
            }
            dataList.push(tmp)
        }

        // Add X axis
        var x = d3.scaleBand()
                    .domain(dataMap.keys())
                    .range([ 0, width])
                    .padding(0.5);


        svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("y", 0)
                .attr("x", 9)
                .attr("dy", ".35em")
                .attr("transform", "rotate(90)")
                .style("text-anchor", "start");

        // Add Y axis
        var y = d3.scaleLinear()
                .domain([-0.6,3.3])
                .nice()
                .range([ height, 0]);
        
        svg.append("g")
            .call(d3.axisLeft(y).tickSize(-width*1.3));

        svg.selectAll(".tick line").attr("stroke", "lightgray");

        // Add X axis label:
        // svg.append("text")
        //   .attr("text-anchor", "end")
        //   .attr("x", width )
        //   .attr("y", height + margin.top + 20)
        //   .text("year,month");

        // Y axis label:
        svg.append("text")
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left + 15)
          .attr("x", -margin.top - height/4)
          .text("Monthly Value Changed  (%)")


        svg.selectAll("vertLines")
            .data(dataList)
            .enter()
            .append("line")
            .attr("x1", function(d){return(x(d.time) + x.bandwidth()/2)})
            .attr("x2", function(d){return(x(d.time) + x.bandwidth()/2)})
            .attr("y1", function(d){return(y(d.min))})
            .attr("y2", function(d){return(y(d.max))})
            .attr("stroke", "black")

        svg.selectAll("boxes")
            .data(dataList)
            .enter()
            .append("rect")
            .attr("x", function(d){return(x(d.time))})
            .attr("y", function(d){return(y(d.median))})
            .attr("height", function(d){return(y(d.q1)-y(d.median))})
            .attr("width", x.bandwidth() )
            .attr("stroke", "black")
            .style("fill", "#69b3a2")
            .on("mouseover", function(event,d) {
               div.transition()
                 .duration(200)
                 .style("opacity", .9);
               div.html("Time : " + d.time  + "<br/> Q3 : " + d.q3  + "<br/> Median: " + d.median + "<br/> Q1: " + d.q1)
                 .style("left", (event.pageX) + "px")
                 .style("top", (event.pageY - 28) + "px");
               })
            .on("mouseout", function(d) {
               div.transition()
                 .duration(500)
                 .style("opacity", 0);
               });

        svg.selectAll("boxes")
            .data(dataList)
            .enter()
            .append("rect")
            .attr("x", function(d){return(x(d.time))})
            .attr("y", function(d){return(y(d.q3))})
            .attr("height", function(d){return(y(d.median)-y(d.q3))})
            .attr("width", x.bandwidth() )
            .attr("stroke", "black")
            .style("fill", "darkseagreen")
            .on("mouseover", function(event,d) {
               div.transition()
                 .duration(200)
                 .style("opacity", .9);
               div.html("Time : " + d.time  + "<br/> Q3 : " + d.q3 + "<br/> Median: " + d.median + "<br/> Q1: " + d.q1)
                 .style("left", (event.pageX) + "px")
                 .style("top", (event.pageY - 28) + "px");
               })
            .on("mouseout", function(d) {
               div.transition()
                 .duration(500)
                 .style("opacity", 0);
               });

        // Show the median
        svg.selectAll("medianLines")
            .data(dataList)
            .enter()
            .append("line")
            .attr("x1", function(d){return(x(d.time))})
            .attr("x2", function(d){return(x(d.time) + x.bandwidth())})
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
        svg.selectAll("maxLines")
            .data(dataList)
            .enter()
            .append("line")
            .attr("x1", function(d){return(x(d.time))})
            .attr("x2", function(d){return(x(d.time) + x.bandwidth())})
            .attr("y1", function(d){return(y(d.max))})
            .attr("y2", function(d){return(y(d.max))})
            .attr("stroke", "black")
            .on("mouseover", function(event,d) {
               div.transition()
                 .duration(200)
                 .style("opacity", .9);
               div.html("Time : " + d.time  + "<br/> Max: " + d.max)
                 .style("left", (event.pageX) + "px")
                 .style("top", (event.pageY - 28) + "px");
               })
             .on("mouseout", function(d) {
               div.transition()
                 .duration(500)
                 .style("opacity", 0);
               });

        svg.selectAll("minLines")
            .data(dataList)
            .enter()
            .append("line")
            .attr("x1", function(d){return(x(d.time))})
            .attr("x2", function(d){return(x(d.time) + x.bandwidth())})
            .attr("y1", function(d){return(y(d.min))})
            .attr("y2", function(d){return(y(d.min))})
            .attr("stroke", "black")
            .on("mouseover", function(event,d) {
               div.transition()
                 .duration(200)
                 .style("opacity", .9);
               div.html("Time : " + d.time  + "<br/> Min: " + d.min)
                 .style("left", (event.pageX) + "px")
                 .style("top", (event.pageY - 28) + "px");
               })
             .on("mouseout", function(d) {
               div.transition()
                 .duration(500)
                 .style("opacity", 0);
               });


// draw line chart
        grouped = d3.group(listing, d=> d.area)
        svg.selectAll(".line")
            .data(grouped)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", function(d){ return colorMap[d[0]] })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
              return d3.line()
                .x(function(d) { return x(d.time) + x.bandwidth()/2; })
                .y(function(d) { return y(d.ratio); })
                (d[1])
            })


        svg.append('g')
            .selectAll("dot")
            .data(listing)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return x(d.time) + x.bandwidth()/2 } )
            .attr("cy", function (d) { return y(d.ratio); } )
            .attr("r", 3)
            .style("fill", function(d){
              return colorMap[d.area]
            })
            .style("opacity", 0.8)
            .style("stroke", "white")
            .on("mouseover", function(event,d) {
               div.transition()
                 .duration(200)
                 .style("opacity", .9);
               div.html("Pending % Change: " + d.ratio + "<br/>" + "Area: " + d.area + "<br/>" + "Time: " + d.time)
                 .style("left", (event.pageX) + "px")
                 .style("top", (event.pageY - 28) + "px");
               })
             .on("mouseout", function(d) {
               div.transition()
                 .duration(500)
                 .style("opacity", 0);
               });

        svg.append('g')
            .selectAll("codeLegend")
            .data(area)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return width - 230} )
            .attr("cy", function (d, i) { return margin.top + i * 25} )
            .attr("r", 10)
            .style("fill", function (d) {
              return colorMap[d]
            })
            .style("opacity", 0.8)

        svg.append('g')
            .selectAll("text")
            .data(area)
            .enter()
            .append("text")
            .attr("fill", "black")
            .attr("font-size", "14px")
            .attr("text-anchor", "middle")
            .attr("y", function(d, i) { return margin.top + i * 25 + 5})
            .attr("x", function (d) { return width - 100})
            .attr("dx", 5)
            .text(function(d){ return d})

}


})();