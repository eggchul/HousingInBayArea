(function(){
var data = []
var res = []
const cities = ['Berkeley', 'San Francisco', 'Palo Alto', 'Mountain View', 'Sunnyvale', 'Foster City']
var types

var svg = d3.select("#my_dataviz").select('#linesvg'),
    margin = {top: 20, right: 100, bottom: 30, left: 100},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var city_selection_line =d3.select("#trend").select("#selectButton")
    .selectAll('myOptions')
    .data(cities)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding v


var div = d3.select("#my_dataviz").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var x = d3.scaleTime().range([0, width - margin.right]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);


const makeLine = (xScale) => d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return y(d.price); });

var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.price); });



draw_line_chart(cities[0])

function update(selectedGroup) {
    draw_line_chart(selectedGroup)
}

d3.select("#selectButton").on("change", function(d) {
    var selectedOption = d3.select(this).property("value")
    update(selectedOption)
})

function draw_line_chart(city){
    // remove existing chart
    d3.select('#my_dataviz svg g').selectAll('svg').remove();
    d3.select('#my_dataviz svg').selectAll('text').remove();
    svg.select('#my_dataviz svg g').select('#x_axis').remove();
    svg.select('#my_dataviz svg g').select('#y_axis').remove();

    d3.csv("house_type_and_price.csv", function(d) {
        if(d.city === city){
            return d;
        }
    })
        .then(function(data) {

            res = []
            for (d of data) {
                if (res[d.city] === undefined){
                    res[d.city] = {}
                }
                if (res[d.city][d.time] === undefined){
                    res[d.city][d.time] = {}
                    res[d.city][d.time][d.house_type] = +d.price
                }else {
                    res[d.city][d.time][d.house_type] = +d.price
                }
            }


            const t = res[Object.keys(res)[0]]
            data = Object.keys(t).map(dateKey => ({ date: new Date(`${dateKey}-28`), ...t[dateKey] }))
            // console.log(res)

            types = ['1', '2', '3', '4', '5'].map(function(id) {
                return {
                    id: id,
                    values: data.map(function(d) {
                        return {date: d.date, price: +d[id]};
                    })
                };
            });

            x.domain(d3.extent(data, function(d) { return d.date; }));

            y.domain([
                d3.min(types, function(c) { return d3.min(c.values, function(d) { return d.price; }); }),
                d3.max(types, function(c) { return d3.max(c.values, function(d) { return d.price; }); })
            ]);

            z.domain(types.map(function(c) { return c.id; }));

            const x_axis = g.append("g")
                .attr("class", "axis axis--x")
                .attr("id", 'x_axis')
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            g.append("g")
                .attr("class", "axis axis--y")
                .attr("id", 'y_axis')
                .call(d3.axisLeft(y))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .attr("fill", "#000")
                .text("price, USD");

            var city = g.selectAll(".city")
                .data(types)
                .enter().append("svg")
                .attr("class", "city")
                .attr("width", width - margin.right);


            function hover(elem) {
                var attrs = elem.srcElement.attributes;
                let id = attrs['data-id'].value;
                let path = city.select(`[id="${id}"]`);
                if (path.attr('visibility') == 'hidden') {
                    return;
                }
                city.selectAll('.line').style('stroke', d => {
                    return 'lightgrey';
                });
                path.style('stroke', z(elem.srcElement['id']));

            }

            // function hoverOnLine(elem) {
            //     console.log(elem)
            //     var d = elem.view.d
            //     var attrs = elem.srcElement.attributes;
            //     let id = attrs['data-id'].value;
            //     let path = city.select(`[id="${id}"]`);
            //     if (path.attr('visibility') == 'hidden') {
            //         return;
            //     }
            //     city.selectAll('.line').style('stroke', d => {
            //         return 'lightgrey';
            //     });
            //     path.style('stroke', z(elem.srcElement['id']));
            //     div.transition()
            //         .duration(200)
            //         .style("opacity", .9);
            //     div.html("City: " + d.city + "<br/>" + "Bedroom: " + d.house_type + "<br/>" + "Price: " + d.price + "<br/>" + "Date: " + d.time)
            //         .style("left", (event.pageX) + "px")
            //         .style("top", (event.pageY - 28) + "px");
            // }

            function exit(elem) {
                var attrs = elem.srcElement.attributes;
                let id = attrs['data-id'].value;
                let path = city.select(`[id="${id}"]`);
                if (path.attr('visibility') == 'hidden') {
                    return;
                }
                city.selectAll('.line').style('stroke', d => {
                    return z(d.id)
                });
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            }

            function click(elem) {
                var attrs = elem.srcElement.attributes;
                let id = attrs['data-id'].value;
                let path = city.select(`[id="${id}"]`);
                if (path.attr('visibility') == 'hidden') {
                    path.attr('visibility', 'visible');
                } else {
                    exit(elem);
                    path.attr('visibility', 'hidden');
                }
            }

            const xAxis = (g, x) => g
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

            function zoomed(event) {
                const xz = event.transform.rescaleX(x);
                city.selectAll('.line').attr("d", function(d) { return makeLine(xz)(d.values); })
                x_axis.call(xAxis, xz);

            }

            const zoom = d3.zoom()
                .scaleExtent([1, 5])
                .extent([[margin.left, 0], [width - margin.right, height]])
                .translateExtent([[margin.left, -Infinity], [width - margin.right, Infinity]])
                .on("zoom", zoomed);

            svg.call(zoom)
                .transition()
                .duration(100)
                .call(zoom.scaleTo, 1, [x(Date.UTC(2012, 1, 1)), 0]);



            city.append("path")
                .attr("class", "line")
                .attr("d", function(d) { return line(d.values); })
                .attr("id", d => d.id.substring(0, 3).toUpperCase())
                .attr("data-id", d => d.id.substring(0, 3).toUpperCase())
                .attr("visibility", "visible")
                .style("stroke", function(d) { return z(d.id); })
                // .on("mouseover", hoverOnLine)
                .on("mouseout", exit);

            svg.selectAll(".label")
                .data(types)
                .enter()
                .append("text")
                .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
                .attr("class", "label")
                .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.price) + ")"; })
                .attr("x", 100)
                .attr("y", 5)
                .attr("dy", "0.35em")
                .attr("id", d => d.id)
                .attr("data-id", d => d.id.substring(0, 3).toUpperCase())
                .style("font", "10px sans-serif")
                .text(function(d) { return d.id + ' bedroom'; })
                .on('click', click)
                .on("mouseover", hover)
                .on("mouseout", exit)
        })
}
})()




