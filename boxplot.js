(function () {
    var margin = {top: 110, right: 200, bottom: 70, left: 80},
        width = 1300 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;
    var area = ["san francisco-oakland-hayward, ca",
        "san jose-sunnyvale-santa clara, ca",
        'bitcoin']

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
        'san francisco-oakland-hayward, ca': "#578dff",
        'san jose-sunnyvale-santa clara, ca': "#f72830",
        'bitcoin': "darkseagreen"
    }


    var promises = [
        d3.csv("./area_listing.csv", function (d) {

            var tmp = d.time
            var check = `${tmp[0]}${tmp[1]}${tmp[2]}${tmp[3]}-${tmp[4]}${tmp[5]}`
            if (check === '2021-03') {
                return
            }
            const obj = {
                area: d.area,
                time: `${tmp[0]}${tmp[1]}${tmp[2]}${tmp[3]}-${tmp[4]}${tmp[5]}`,
                timeObject: d3.timeParse("%Y%m")(tmp),
                ratio: +d.pending_ratio_mm
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
            if (month < 10) {
                time = `${year}-0${month}`
            } else {
                time = `${year}-${month}`
            }

            var dailyChange = Number(table[i]['daily-change'])
            if (!dataMap.has(time)) {
                dataMap.set(time, [])
            }
            var tmp = dataMap.get(time)
            tmp.push(dailyChange)
            dataMap.set(time, tmp)
        }
        for (let [key, value] of dataMap) {
            var arr = value.sort(function (a, b) {
                return a - b
            });
            var tmp = {
                time: key,
                timeObject: d3.timeParse("%Y-%m")(key),
                q1: d3.quantile(arr, 0.25).toFixed(2),
                q3: d3.quantile(arr, 0.75).toFixed(2),
                median: d3.quantile(arr, 0.5).toFixed(2),
                max: d3.max(arr).toFixed(2),
                min: d3.min(arr).toFixed(2),
            }
            dataList.push(tmp)
        }

        // Add X axis
        var x = d3.scaleBand()
            .domain(dataMap.keys())
            .range([0, width])
            .padding(0.5);

        var xTime = d3.scaleTime()
            .domain([
                new Date(d3.min(listing.map(d => d3.timeMonth.offset(d.timeObject, -1)))),
                new Date(d3.max(listing.map(d => d3.timeMonth.offset(d.timeObject, 1)))),
            ])
            .range([0, width])

        // Add Y axis
        var y = d3.scaleLinear()
            .domain(d3.extent([
                ...listing.map(({ratio}) => ratio),
                ...dataList.map(({min}) => min),
                ...dataList.map(({max}) => max),
            ]))
            .nice()
            .range([height, 0]);

        var xAxis = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xTime).tickSizeOuter(0).tickFormat(d3.timeFormat("%m/%y")));

        var yAxis = svg.append("g")
            .call(d3.axisLeft(y).tickSize(-width));

        svg.selectAll(".tick line").attr("stroke", "lightgray");

        // Y axis label:
        svg.append("text")
            .attr("className", "chart4ylabel")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -margin.top)
            .html("Monthly Value Changed Ratio ");
        svg.append("text")
            .attr("className", "chart4ylabel")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 45)
            .attr("x", -margin.top/3)
            .html("(Current Month - Previous Month) / Previous Month");

        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0);

        function zoomed(event) {
            // recover the new scale
            var newXTime = event.transform.rescaleX(xTime);
            var newTimeDomain = newXTime.domain();
            var allPoints = [];
            var pointKeys = []
            listing.forEach(function (d) {
                if (d.timeObject.getTime() > newTimeDomain[0].getTime() && d.timeObject < newTimeDomain[1].getTime()) {
                    allPoints.push(d.ratio);
                    pointKeys.push(d.time);
                }
            });
            x.domain(pointKeys);
            dataList.forEach(function (d) {
                if (d.timeObject.getTime() > newTimeDomain[0].getTime() && d.timeObject < newTimeDomain[1].getTime()) {
                    allPoints.push(+d.max);
                    allPoints.push(+d.min);
                }
            });
            y.domain(d3.extent(allPoints)).nice();


            // update axes with these new boundaries
            xAxis.call(d3.axisBottom(newXTime).tickSizeOuter(0).tickFormat(d3.timeFormat("%m/%y")));
            yAxis.call(d3.axisLeft(y).tickSize(-width));
            svg.selectAll(".tick line").attr("stroke", "lightgray");
            // update box plot
            grapthWrapper
                .selectAll(".vertLines")
                .attr("x1", function (d) {
                    return (newXTime(d.timeObject))
                })
                .attr("x2", function (d) {
                    return (newXTime(d.timeObject))
                })
                .attr("y1", function (d) {
                    return (y(d.min))
                })
                .attr("y2", function (d) {
                    return (y(d.max))
                })
            grapthWrapper
                .selectAll(".boxes-a")
                .attr("x", function (d) {
                    return (newXTime(d.timeObject) - x.bandwidth() / 2)
                })
                .attr("y", function (d) {
                    return (y(d.median))
                })
                .attr("height", function (d) {
                    return (y(d.q1) - y(d.median))
                })
                .attr("width", x.bandwidth())
            grapthWrapper
                .selectAll(".boxes-b")
                .attr("x", function (d) {
                    return (newXTime(d.timeObject) - x.bandwidth() / 2)
                })
                .attr("y", function (d) {
                    return (y(d.q3))
                })
                .attr("height", function (d) {
                    return (y(d.median) - y(d.q3))
                })
                .attr("width", x.bandwidth())
            grapthWrapper
                .selectAll(".medianLines")
                .attr("x1", function (d) {
                    return (newXTime(d.timeObject) - x.bandwidth() / 2)
                })
                .attr("x2", function (d) {
                    return (newXTime(d.timeObject) + x.bandwidth() / 2)
                })
                .attr("y1", function (d) {
                    return (y(d.median))
                })
                .attr("y2", function (d) {
                    return (y(d.median))
                })
            grapthWrapper
                .selectAll(".maxLines")
                .attr("x1", function (d) {
                    return (newXTime(d.timeObject) - x.bandwidth() / 2)
                })
                .attr("x2", function (d) {
                    return (newXTime(d.timeObject) + x.bandwidth() / 2)
                })
                .attr("y1", function (d) {
                    return (y(d.max))
                })
                .attr("y2", function (d) {
                    return (y(d.max))
                })
            grapthWrapper
                .selectAll(".minLines")
                .attr("x1", function (d) {
                    return (newXTime(d.timeObject) - x.bandwidth() / 2)
                })
                .attr("x2", function (d) {
                    return (newXTime(d.timeObject) + x.bandwidth() / 2)
                })
                .attr("y1", function (d) {
                    return (y(d.min))
                })
                .attr("y2", function (d) {
                    return (y(d.min))
                })
            // update line chart
            grapthWrapper
                .selectAll(".linechart-dot")
                .attr('cx', function (d) {
                    return newXTime(d.timeObject)
                })
                .attr('cy', function (d) {
                    return y(d.ratio)
                });
            grapthWrapper
                .selectAll(".linechart-line")
                .attr("d", function (d) {
                    return d3.line()
                        .x(function (d) {
                            return newXTime(d.timeObject);
                        })
                        .y(function (d) {
                            return y(d.ratio);
                        })
                        (d[1])
                })
        }

        // reference https://www.d3-graph-gallery.com/graph/interactivity_zoom.html#axisZoom
        const zoom = d3.zoom()
            .scaleExtent([1, 5])
            .extent([[margin.left, 0], [width - margin.right, height]])
            .translateExtent([[margin.left, -Infinity], [width - margin.right, Infinity]])
            .on("zoom", zoomed);

        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .call(zoom);
        var grapthWrapper = svg.append('g')
            .attr("clip-path", "url(#clip)");

        grapthWrapper.selectAll("vertLines")
            .data(dataList)
            .enter()
            .append("line")
            .attr("x1", function (d) {
                return (xTime(d.timeObject))
            })
            .attr("x2", function (d) {
                return (xTime(d.timeObject))
            })
            .attr("y1", function (d) {
                return (y(d.min))
            })
            .attr("y2", function (d) {
                return (y(d.max))
            })
            .attr("stroke", "black")
            .attr("class", "vertLines")

        grapthWrapper.selectAll("boxes")
            .data(dataList)
            .enter()
            .append("rect")
            .attr("x", function (d) {
                return (xTime(d.timeObject) - x.bandwidth() / 2)
            })
            .attr("y", function (d) {
                return (y(d.median))
            })
            .attr("height", function (d) {
                return (y(d.q1) - y(d.median))
            })
            .attr("width", x.bandwidth())
            .attr("stroke", "black")
            .attr("class", "boxes-a")
            .style("fill", "#69b3a2")
            .on("mouseover", function (event, d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("Time : " + d3.timeFormat("%m/%y")(d.timeObject) + "<br/> Q3 : " + d.q3 + "<br/> Median: " + d.median + "<br/> Q1: " + d.q1)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        grapthWrapper.selectAll("boxes")
            .data(dataList)
            .enter()
            .append("rect")
            .attr("x", function (d) {
                return (xTime(d.timeObject) - x.bandwidth() / 2)
            })
            .attr("y", function (d) {
                return (y(d.q3))
            })
            .attr("height", function (d) {
                return (y(d.median) - y(d.q3))
            })
            .attr("width", x.bandwidth())
            .attr("stroke", "black")
            .attr("class", "boxes-b")
            .style("fill", "darkseagreen")
            .on("mouseover", function (event, d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("Time : " + d3.timeFormat("%m/%y")(d.timeObject) + "<br/> Q3 : " + d.q3 + "<br/> Median: " + d.median + "<br/> Q1: " + d.q1)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Show the median
        grapthWrapper.selectAll("medianLines")
            .data(dataList)
            .enter()
            .append("line")
            .attr("x1", function (d) {
                return (xTime(d.timeObject) - x.bandwidth() / 2)
            })
            .attr("x2", function (d) {
                return (xTime(d.timeObject) + x.bandwidth() / 2)
            })
            .attr("y1", function (d) {
                return (y(d.median))
            })
            .attr("y2", function (d) {
                return (y(d.median))
            })
            .attr("stroke", "black")
            .attr("stroke-width", "1")
            .attr("class", "medianLines")
            .on("mouseover", function (event, d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("Median: " + d.median)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        // Show the median
        grapthWrapper.selectAll("maxLines")
            .data(dataList)
            .enter()
            .append("line")
            .attr("x1", function (d) {
                return (xTime(d.timeObject) - x.bandwidth() / 2)
            })
            .attr("x2", function (d) {
                return (xTime(d.timeObject) + x.bandwidth() / 2)
            })
            .attr("y1", function (d) {
                return (y(d.max))
            })
            .attr("y2", function (d) {
                return (y(d.max))
            })
            .attr("stroke", "black")
            .attr("stroke-width", "1")
            .attr("class", "maxLines")
            .on("mouseover", function (event, d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("Time : " + d3.timeFormat("%m/%y")(d.timeObject) + "<br/> Max: " + d.max)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        grapthWrapper.selectAll("minLines")
            .data(dataList)
            .enter()
            .append("line")
            .attr("x1", function (d) {
                return (xTime(d.timeObject) - x.bandwidth() / 2)
            })
            .attr("x2", function (d) {
                return (xTime(d.timeObject) + x.bandwidth() / 2)
            })
            .attr("y1", function (d) {
                return (y(d.min))
            })
            .attr("y2", function (d) {
                return (y(d.min))
            })
            .attr("stroke", "black")
            .attr("stroke-width", "1")
            .attr("class", "minLines")
            .on("mouseover", function (event, d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("Time : " + d3.timeFormat("%m/%y")(d.timeObject) + "<br/> Min: " + d.min)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });


// draw line chart
        grouped = d3.group(listing, d => d.area)
        grapthWrapper.append
        grapthWrapper.selectAll(".line")
            .data(grouped)
            .enter()
            .append("path")
            .attr("class", "none")
            .attr("fill", "none")
            .attr("stroke", function (d) {
                return colorMap[d[0]]
            })
            .attr("stroke-width", 1.5)
            .attr("class", 'linechart-line')
            .attr("d", function (d) {
                return d3.line()
                    .x(function (d) {
                        return xTime(d.timeObject);
                    })
                    .y(function (d) {
                        return y(d.ratio);
                    })
                    (d[1])
            })


        grapthWrapper.append('g')
            .selectAll(".linechart-dot")
            .data(listing)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return xTime(d.timeObject)
            })
            .attr("cy", function (d) {
                return y(d.ratio);
            })
            .attr("r", 3)
            .attr("class", 'linechart-dot')
            .style("fill", function (d) {
                return colorMap[d.area]
            })
            .style("opacity", 0.8)
            .style("stroke", "white")
            .on("mouseover", function (event, d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("Pending % Change: " + d.ratio + "<br/>" + "Area: " + d.area + "<br/>" + "Time: " + d3.timeFormat("%m/%y")(d.timeObject))
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        svg.append('g')
            .selectAll("codeLegend")
            .data(area)
            .enter()
            .append("circle")
            .attr("cx", function (d, i) {
                return 0 + i * 300
            })
            .attr("cy", function () {
                return margin.top - 135
            })
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
            .attr("text-anchor", "letf")
            .attr("y", function () {
                return margin.top - 130
            })
            .attr("x", function (d, i) {
                return 0 + i * 300 + 10
            })
            .attr("dx", 5)
            .text(function (d) {
                return d
            })

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("y", height + 20)
            .attr("x", width + 50)
            .text("MM/YY")
    }


})();
