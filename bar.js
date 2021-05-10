(function(){

//list out shared data
  var table
  var area = ["san francisco-oakland-hayward, ca",
    "san jose-sunnyvale-santa clara, ca"]
  var x, y

  var area_selection_line =d3.select("#selectButton2")
    .selectAll('myOptions')
    .data(area)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; })
// set up svg size
  var margin = {top: 100, right: 300, bottom: 80, left: 100},
    width = 1200 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

  var svg = d3.select("#bar-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    // .style("background-color", 'lightyellow')
    .append("g")
    .attr("id", 'wrapper')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var div = d3.select("#bar-chart-tool").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  var cfg = {
    labelMargin: 15,
    xAxisMargin: 10,
    legendRightMargin: 0
  };

  var months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

  draw_bar(area[0])
// reference : https://d3-legend.susielu.com/
// https://codepen.io/jchowe/pen/WLNXqB
  function update(selectedGroup) {
    d3.selectAll("#wrapper").html("");
    draw_bar(selectedGroup)
  }

  d3.select("#selectButton2").on("change", function(d) {
    var selectedOption = d3.select(this).property("value")
    update(selectedOption)
  })

  function draw_bar(areagroup){
    d3.csv("./area_listing.csv", function(d) {
      if(d.area == areagroup){
        var tmp = d.time
        d.time = d3.timeParse("%Y%m")(tmp);
        d.new_listing_count_mm = Number(d.new_listing_count_mm) * 100;
        return d
      }
    })
      .then((res)=> {
        table = res
        var xTime = d3.scaleTime()
          .domain([
            new Date(d3.min(table.map(d=>d3.timeMonth.offset(d.time, -1)))),
            new Date(d3.max(table.map(d=>d3.timeMonth.offset(d.time, 1)))),
          ])
          .range([0, width])


        x = d3.scaleBand()
          .domain(table.map(d=>d.time).reverse())
          .range([0, width])
          .padding(0.1)

        // Add Y axis
        y = d3.scaleLinear()
          .domain(d3.extent(table, function(d) {return +d.new_listing_count_mm;}))
          .nice()
          .range([ height, 0]);


        svg.append("g")
          .attr('name', 'x-axis')
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(xTime).tickSizeOuter(0).tickFormat(d3.timeFormat("%m/%y")))
          .selectAll("text")
          .style('font-size', '16px');

        svg.append("g")
          .call(d3.axisLeft(y).tickSize(-width*1).ticks(10))
          .selectAll('text')
          .style('font-size', '16px');

        svg.selectAll(".tick line").attr("stroke", "lightgray")


        var extent = d3.extent(table, d => +d.new_listing_count_mm)

        //legend
        var colorScale = d3.scaleDiverging()
          // .domain([-60, 0,])
          .domain([extent[0], 0, extent[1]]).nice()
          .interpolator(d3.interpolateSpectral)

        var legend = d3.legendColor()
          .title("% Changed Comparing to Previous Month")
          .titleWidth(200)
          .labelFormat(d3.format(".0f"))
          .scale(colorScale)
          .cells([-60, -30, 0, 30, 60, 90, 120, 150]);



        svg.selectAll("rect")
          .data(table)
          .enter()
          .append("rect")
          .attr("x", function(d) {
            return xTime(d.time) -  x.bandwidth() / 2;
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
            svg.selectAll("rect").attr("fill",'lightgrey');
            d3.select(this).attr("fill", function(d){
              return colorScale(d.new_listing_count_mm)
            });
            div.transition()
              .duration(200)
              .style("opacity", .9);
            div.html("Change: " + d.new_listing_count_mm.toFixed(2) + "% <br/>" + "Time: " + d3.timeFormat("%m/%y")(d.time))
              .style("left", (event.pageX + 30) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function(d) {
            svg.selectAll("rect").attr("fill", function(d){
              return colorScale(d.new_listing_count_mm)
            });
            div.transition()
              .duration(500)
              .style("opacity", 0);
          });

        // X axis label:
        svg.append("text")
          .attr("text-anchor", "end")
          .attr("y", height + 20)
          .attr("x", width + 100)
          .text("MM/YY")
          .style("font-size", '16px')

        // Y axis label:
        svg.append("text")
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left + 50)
          .attr("x", margin.top - 100)
          .text("Monthly Amount of New Listing Changed (%)")
          .style("font-size", '16px')

        svg.append("g")
          .attr("transform", "translate(" + (width + margin.left) + ",10)")
          .call(legend);

        // annotation
          const type = d3.annotationCustomType(
              d3.annotationXYThreshold,
              {
                  "note":{
                      "lineType":"none",
                      "orientation": "top",
                      "align":"middle",
                      "width": "30px",
                      "backgroundColor":"pink"
                    }
              }
          )

          const listOfNote = []
          if(areagroup === area[0]){
              listOfNote.push(
                  {
                      data: { time: d3.timeParse("%Y%m")('202006'), new_listing_count_mm: 13.61 },
                      note: {
                          label: "“Pent-up Supply” Floods San Francisco Housing Market",
                          lineType:"none",
                          orientation: "leftRight",
                          align: "middle",
                      },
                      dy: -200,
                      dx: 0,
                      type: d3.annotationCalloutCircle,
                      subject: { radius: 40 },
                      className: "clickable-note",
                      connector: {
                          end: "arrow" // 'dot' also available
                      },
                  })
          }

          const annotations = listOfNote.map(function(d){
              d.color = "steelblue";
              return d;
          });

          const makeAnnotations = d3.annotation()
          // .editMode(true)

          //also can set and override in the note.padding property
          //of the annotation object
              .notePadding(15)
              .type(type)
              .accessors({
                  x: d => xTime(d.time),
                  y: d => y(d.new_listing_count_mm),
              })
              // .accessorsInverse({
              //     time: d => xTime.invert(d.x),
              //     new_listing_count_mm: d => y.invert(d.y)
              // })
              .annotations(annotations)
              .on('noteclick', () => window.open('https://wolfstreet.com/2020/07/17/pent-up-supply-floods-san-francisco-housing-market-most-since-housing-bust/'))

          svg.append("g")
              .attr("class", "annotation-group")
              .call(makeAnnotations)
      })
  }


})();
