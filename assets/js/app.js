//================ Initialize the svg plotting space  =======================================
// Set the hegith and width for the svg plotting area.
var svgWidth = 960;
var svgHeight = 600;

//Set a margin on all sides of the svg area.
var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

// Get the available svg area that can be used by the plot (width and height)
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Set the path of the data file
var dataFile = "./assets/data/data.csv"

// ===========  Functions ============================================================
// // Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcareLow";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis])-1 ,
                 d3.max(censusData, d => d[chosenXAxis])
        ])
        .range([0, chartWidth]);
    return xLinearScale;
}

function yScale(censusData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis])-1, d3.max(censusData, d => d[chosenYAxis])])
        .range([chartHeight, 0]);
    return yLinearScale;
}

// function used for updating X Axis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// function used for updating Y Axis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// function used for updating circles group with a transition to new circles
function xRenderCircles(circlesGroup, newXScale,  chosenXAxis) {
    console.log("render x circles")
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        //----------------
        // .attr("cy", d => newYScale(d[chosenYAxis]))
        //----------------
    return circlesGroup;
}

// function to update the position  of the circle labels based on the new values
function xRenderCircleText(circleLabel, newXScale, chosenXAxis){
    circleLabel.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    // .attr("y", d => newYScale(d[chosenYAxis]))
    return circleLabel;
}

function yRenderCircles(circlesGroup, newYScale,  chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        // .attr("cx", d => newYScale(d[chosenYAxis]))
        //----------------
        .attr("cy", d => newYScale(d[chosenYAxis]))
        //----------------
    return circlesGroup;
}

// function to update the position  of the circle labels based on the new values
function yRenderCircleText(circleLabel, newYScale, chosenYAxis){
    circleLabel.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]))
    // .attr("y", d => newYScale(d[chosenYAxis]))
    return circleLabel;
}


// Convert the string to title case
function toTitleCase(getStr)
{
    var titleStr = getStr.replace(getStr.substr(0,1), getStr.substr(0,1).toUpperCase());
    titleStr = titleStr.replace(titleStr.substr(1), titleStr.substr(1).toLowerCase());
    return titleStr;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {    
    
    var xLabel = toTitleCase(chosenXAxis);
    var yLabel;
    if(chosenYAxis === "healthcareLow") {yLabel = "HealthCare"}
    else {    yLabel = toTitleCase(chosenYAxis);  }    

    console.log(`Tooltip =>  X-axis: ${chosenXAxis}    Y-axis: ${chosenYAxis}`)
    console.log(`xlabel : ${xLabel}    yLabel:  ${yLabel}`)
    var toolTip = d3.tip()
        .attr("class", "d3-tip")   
        .html(function (d) {
            return (`${d.state} <br> ${yLabel}: ${d[chosenYAxis]} <br> ${xLabel}: ${d[chosenXAxis]}`);
        });
    circlesGroup.call(toolTip);
  
    // put event listener here
    circlesGroup
        .on("mouseover", function (data) {
            console.log("tip");
            toolTip.show(data, this);
        })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });
}

// ===================================================================================

d3.csv(dataFile).then(function (censusData, err) {
    if (err) throw err;
    // parse data to integer
    censusData.forEach(function (data) {
        // data columns for x-axis
        data.poverty = +data.poverty;
        data.income = +data.income;
        data.age = +data.age;
        
        // data columns for y-axis
        data.obesity = +data.obesity;
        data.healthcareLow = +data.healthcareLow;
        data.smokes = +data.smokes;
    });

    // Define the scale for the selected/active X axis based on the csv data
    var xLinearScale = xScale(censusData, chosenXAxis);    

    // Define the scale for the selected/active Y axis based on the csv data
    var yLinearScale = yScale(censusData, chosenYAxis);    

    // Create initial axis functions
    var leftAxis = d3.axisLeft(yLinearScale);
    var bottomAxis = d3.axisBottom(xLinearScale);    

    // Append X axis
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .classed("x-axis", true)
        .call(bottomAxis);
  
    // Append Y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);    

    // Append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("fill", "lightblue")
        .attr("stroke", "gray");

    console.log(`X: ${chosenXAxis}    ;    Y:  ${chosenYAxis}`);
    // Display state abbrevation labels inside the circles
    var circleLabel = chartGroup.selectAll(null).data(censusData)
        .enter()
        .append("text")     
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))   
        // circleLabel.attr("x", function(d) {
        //     return xLinearScale(d[chosenXAxis])
        // })
        // circleLabel.attr("y", function(d) {
        //     return yLinearScale(d[chosenYAxis])
        // })
        .text(function (d){ return d.abbr; })
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("text-anchor", "middle")
        .attr("fill", "navy");

        
    // Show the toolTip for the current circle data point
    updateToolTip(chosenXAxis, chosenYAxis, circlesGroup)
        
    // Create group for two x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth/2}, ${chartHeight + 20})`)

    // Create group for two y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        // .attr("transform", `translate(${chartWidth/2}, ${chartHeight + 20})`)

    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("Poverty (%)")
    
    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (%)")

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (%)")        

    var obesityLabel = yLabelsGroup.append("text")
        .attr("transform", `rotate(-90)`)
        .attr("y", 0-margin.left + 10)
        .attr("x", 0 - chartHeight/2 )
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obesity (%)")

    var healthLabel = yLabelsGroup.append("text")
        .attr("transform", `rotate(-90)`)
        .attr("y", 0-margin.left + 50)
        .attr("x", 0 - chartHeight/2)
        .attr("dy", "1em")
        .attr("value", "healthcareLow")
        .classed("active", true)
        .text("Lacks Healthcare")        

    var smokesLabel = yLabelsGroup.append("text")
        .attr("transform", `rotate(-90)`)
        .attr("y", 0-margin.left + 30)
        .attr("x", 0 - chartHeight/2)
        .attr("value", "smokes")
        .attr("dy", "1em")
        .classed("inactive", true)
        .text("Smokes (%)")        

    // Event Handler - Change the chart and X axis labels on click
    xLabelsGroup.selectAll("text")
        .on("click", function(){
            // Get the selected x-axis label
            var xValue = d3.select(this).attr("value");
            if (xValue !== chosenXAxis) {
                // Replace the selected x axis value
                chosenXAxis = xValue;
                console.log(`Selected :  ${chosenXAxis}`);
                
                // Update the scale bsed on the new selection
                xLinearScale = xScale(censusData, chosenXAxis);

                // Update the transition for the new selection
                xAxis = renderXAxes(xLinearScale, xAxis);

                // Update the circles with new xaxis values
                circlesGroup = xRenderCircles(circlesGroup, xLinearScale, chosenXAxis);
                circleLabel = xRenderCircleText(circleLabel, xLinearScale, chosenXAxis);

                // Change the style of the axis label as the selection changes
                switch(chosenXAxis) {
                    case "poverty":
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false)
                        ageLabel
                            .classed("inactive", true)  
                        incomeLabel
                            .classed("inactive", true)                          
                        break;
                    case "age":
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false)
                        povertyLabel
                            .classed("inactive", true)
                        incomeLabel
                            .classed("inactive", true)
                            break;
                    case "income":
                        povertyLabel
                            .classed("inactive", true)
                        ageLabel
                            .classed("inactive", true)
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false)
                        break;
                    default:
                        break;
                }
                // Update the tooltip display based on the new selection
                updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            }
    })

    
    yLabelsGroup.selectAll("text")
        .on("click", function(){
        // Get the selected x-axis label
        var yValue = d3.select(this).attr("value");
        if (yValue !== chosenYAxis) {
            // Replace the selected x axis value
            chosenYAxis = yValue;
            console.log(`Selected Y:  ${chosenYAxis}`);
            
    //         // Update the scale bsed on the new selection
            yLinearScale = yScale(censusData, chosenYAxis);

            // Update the transition for the new selection
            yAxis = renderYAxes(yLinearScale, yAxis);

            // Update the circles with new xaxis values
            circlesGroup = yRenderCircles(circlesGroup, yLinearScale, chosenYAxis);
            circleLabel = yRenderCircleText(circleLabel, yLinearScale, chosenYAxis);

            // Change the style of the axis label as the selection changes
            switch(chosenYAxis) {
                case "obesity":
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    smokesLabel
                        .classed("inactive", true)
                    healthLabel
                        .classed("inactive", true)
                    break;
                case "smokes":
                    obesityLabel
                        .classed("inactive", true)
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    healthLabel
                        .classed("inactive", true)
                    break;
                case "healthcareLow":
                    obesityLabel
                        .classed("inactive", true)
                    smokesLabel
                        .classed("inactive", true)
                    healthLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    break;
                default:
                    break;    
            }
            // Update the tooltip display based on the new selection
            updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        }
    })


}).catch(function (error) {
    console.log(error); 

});





// // When the browser loads, makeResponsive() is called.
// // makeResponsive();

// // When the browser window is resized, responsify() is called.
// // d3.select(window).on("resize", makeResponsive);