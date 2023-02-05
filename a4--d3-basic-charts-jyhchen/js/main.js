// write your javascript code here.
// feel free to change the pre-set attributes as you see fit

let margin = {
        top: 60,
        left: 50,
        right: 30,
        bottom: 25
    },
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


// first visualization
let svg1 = d3.select('#vis1')
    .append('svg')
    .attr('preserveAspectRatio', 'xMidYMid meet') // this will scale your visualization according to the size of its parent element and the page.
    .attr('width', '100%') // this is now required by Chrome to ensure the SVG shows up at all
    .style('background-color', '#ccc') // change the background color to light gray
    .attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))


// second visualization
let svg2 = d3.select('#vis2')
    .append('svg')
    .attr('preserveAspectRatio', 'xMidYMid meet') // this will scale your visualization according to the size of its parent element and the page.
    .attr('width', '100%') // this is now required by Chrome to ensure the SVG shows up at all
    .style('background-color', '#ccc') // change the background color to light gray
    .attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))

// load fb by inning csv
d3.csv('data/lowther_fb.csv', function(d) {
    return {
        inning: d.inning,
        release_speed: +d.release_speed,
    };
}).then(lineChart);

function lineChart(data) {
    // calculate limits for the x and y axis
    console.log(data);
    let maxInning = d3.max(data, function(d) { return d.inning; });
    let minInning = d3.min(data, function(d) { return d.inning; });
    let maxVelo = d3.max(data, function(d) { return d.release_speed; });
    let minVelo = d3.min(data, function(d) { return d.release_speed; });

    let chartGroup = svg1
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // create, scale, and add x and y-axis
    let xScale = d3.scaleLinear()
        .domain([minInning, maxInning])
        .range([0, width - margin.left - margin.right]);
    let yScale = d3.scaleLinear()
        .domain([75, maxVelo])
        .range([height - margin.bottom - margin.top, 0]);

    let xAxis = d3.axisBottom(xScale);
    chartGroup.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + (height - margin.bottom - margin.top) + ')')
        .call(xAxis);
    let yAxis = d3.axisLeft(yScale);
    chartGroup.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0, 0)')
        .call(yAxis);

    // initialize colors the gradient
    chartGroup.append("linearGradient")
        .attr("id", "line-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("y1", yScale(minVelo)) // add max and min
        .attr("x2", 0)
        .attr("y2", yScale(maxVelo))
        .selectAll("stop")
        .data([
            { offset: "0%", color: "blue" },
            { offset: "100%", color: "red" }
        ])
        .enter().append("stop")
        .attr("offset", function(d) { return d.offset; })
        .attr("stop-color", function(d) { return d.color; });



    // create line chart line, plotting speed against innings
    chartGroup.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "url(#line-gradient)") // color is from gradient
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(function(d) { return xScale(d.inning) })
            .y(function(d) { return yScale(d.release_speed) })
        )

    // Create the circle that travels along the curve of chart
    var focus = chartGroup
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "black")
        .attr('r', 8.5)
        .style("opacity", 0)

    // Create the text that updates with mouse over function
    var focusText = chartGroup
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")

    // Create a rect on top of the svg area: this rectangle recovers mouse position
    chartGroup
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);


    // makes text show up when mouse moves
    function mouseover() {
        focus.style("opacity", 1)
        focusText.style("opacity", 1)
    }

    // helper function for finding inning from mouse position
    function getInning(ip) {
        if (ip < 1) {
            var formatInning = 0;
        } else if (ip > 8) {
            var formatInning = 8;
        } else {
            var formatInning = Math.floor(ip);
        }
        return formatInning;
    }

    function mousemove() {
        // recover x coordinate we need and select the dict from data
        var x0 = xScale.invert(d3.pointer(event)[0])
        selectedData = data[getInning(x0 - 1)]
            // format and show data
        focus
            .attr("cx", xScale(selectedData.inning))
            .attr("cy", yScale(selectedData.release_speed))
        focusText
            .html("inning: " + selectedData.inning + " " + "mph: " + selectedData.release_speed)
            .attr("x", top)
            .attr("y", width)
    }

    // makes text disappear when mouse is not on graph
    function mouseout() {
        focus.style("opacity", 0)
        focusText.style("opacity", 0)
    }


}

// load pitch breakdown
d3.csv('data/lowther_mix.csv', function(d) {
    return {
        date: d.date,
        ff: parseInt(d.ff),
        ch: parseInt(d.ch),
        sl: parseInt(d.sl),
        cu: parseInt(d.cu),
    };
}).then(groupBar);

function groupBar(data) {

    let chartGroup = svg2
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // make list of subgroups
    var subgroups = data.columns.slice(1)
    console.log(subgroups)

    // make list of groups (x axis)
    var groups = data.map(d => d.date)
    console.log(groups)
        // create, scale, and add x and y axis based on dimensions
    let x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2])
    let y = d3.scaleLinear()
        .domain([0, 50])
        .range([height, 0]);

    chartGroup.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(0));
    chartGroup.append("g")
        .call(d3.axisLeft(y));

    // Another scale for to evenly place subgroups
    let xSubgroup = d3.scaleBand()
        .domain(subgroups)
        .range([0, x.bandwidth()])
        .padding([0.05])

    // create color map for subgroups
    var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#ffff00'])

    // create bar charts
    chartGroup.append("g")
        .selectAll("g")
        // one loop per group and color the bars based on group
        .data(data)
        .enter()
        .append("g")
        .attr("transform", function(d) { return "translate(" + x(d.date) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return subgroups.map(function(key) { return { key: key, value: d[key] }; }); })
        .enter().append("rect")
        .attr("x", function(d) { return xSubgroup(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", xSubgroup.bandwidth())
        .attr("height", function(d) { return height - y(d.value); })
        .attr("fill", function(d) { return color(d.key); });

    // create color legend for bar chart and add to graph   
    var legend = chartGroup.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(subgroups.slice())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 17)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color)
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .on("click", function(d) { update(d) });

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { return d; });



}