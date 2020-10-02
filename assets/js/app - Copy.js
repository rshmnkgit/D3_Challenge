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

//==================================================================================
var dataFile = "./assets/data/data.csv"

//     // Function to display the chart based on the axis label clicked
// d3.csv(dataFile).then(function (censusData, err) {
//     censusData.forEach(function (data) {
//         console.log(data.poverty);
// // Append a rectangle and set its height in relation to the booksReadThisYear value
//     chartGroup.append("circle")
//         .data(censusData)

//         // .classed("bar", true)
//         // .classed("bar:hover", true)    
//         .attr("cx", data.poverty * 20)
//         .attr("cy", data.healthcareLow + 50)
//         .attr("r", function(d) {
//             return (d.poverty);
//         })
//         .attr("stroke-width", "2")
//         .attr("stroke", "pink")
//     });
// });

// chartGroup.selectAll(".bar")
//     .data(tvData)
//     .enter()
//     .append("rect")
//     .classed("bar", true)
//     .attr("width", d => barWidth)
//     .attr("height", d => d.hours * scaleY)
//     .attr("x", (d,i) => i* (barWidth+barSpacing))
//     .attr("y", d=>chartHeight-d.hours*scaleY)


// ===========  Functions ============================================================
// // Initial Params
var chosenXAxis = "poverty";
// var selectedYAxis = "healthcareLow";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) ,
                 d3.max(censusData, d => d[chosenXAxis])
        ])
        .range([0, chartWidth]);
    return xLinearScale;
}

// function used for updating X Axis var upon click on axis label
function render_XAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    var label;
    if (chosenXAxis === "poverty") {
        label = "Poverty ";
    }
    else {
        label = "Lacks Healthcare ";
    }
    
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        // console.log(`${d[chosenXAxis]} :: ${d.healthcareLow}`)
        // .offset([80, -60 ])
        .html(function (d) {
            return (`${d.healthcareLow}<br> ${label} ${d[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

// ===================================================================================

d3.csv(dataFile).then(function (censusData, err) {
    if (err) throw err;

    // var poverty = censusData.map(data => +data.poverty);
    // var obesity = censusData.map(data => +data.obesity);
    // var age = censusData.map(data => +data.age);
    // var income = censusData.map(data => +data.income);

    // parse data to integer
    censusData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.obesity = +data.obesity;
        data.healthcareLow = +data.healthcareLow;
        data.age = +data.age;
    });

    // Define xLinearScale for the csv data
    var xLinearScale = xScale(censusData, chosenXAxis);

    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(censusData, d => d.healthcareLow)])
        .range([chartHeight, 0])

    // Create initial axis functions
    var leftAxis = d3.axisLeft(yLinearScale);
    var bottomAxis = d3.axisBottom(xLinearScale);    

    // var xAxis = chartGroup.append("g")
    //     .attr("transform", `translate(0, ${chartHeight})`)
    //     .call(bottomAxis);

    // Append X axis
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .classed("x-axis", true)
        .call(bottomAxis);
  
    // Append Y axis
    chartGroup.append("g")
        .call(leftAxis);    

    // Append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.healthcareLow))
        // .attr("r", d => d.poverty)
        .attr("r", 15)
        .attr("fill", "lightblue")
        .attr("stroke", "skyblue");

    var circleLabel = chartGroup.selectAll(null).data(censusData)
        .enter()
        .append("text")        
        circleLabel.attr("x", function(d) {
            return xLinearScale(d[chosenXAxis])
        })
        circleLabel.attr("y", function(d) {
            return yLinearScale(d.healthcareLow)
        })
        .text(function (d){
            return d.abbr;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("text-anchor", "middle")
        .attr("fill", "black");
    
    // Create group for two x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth/2}, ${chartHeight + 20})`)

        
    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("Poverty (%)")
    
    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("active", false)
        .text("Age (%)")

    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("active", false)
        .text("Household Income (%)")        
    
    var obesityLabel = chartGroup.append("text")
        .attr("transform", `rotate(-90)`)
        .attr("y", 0-margin.left + 10)
        .attr("x", 0 - chartHeight/2 )
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("active", false)
        .text("Obesity (%)")

    var healthLabel = chartGroup.append("text")
        .attr("transform", `rotate(-90)`)
        .attr("y", 0-margin.left + 50)
        .attr("x", 0 - chartHeight/2)
        .attr("dy", "1em")
        .attr("value", "healthcareLow")
        .classed("active", true)
        .text("Lacks Healthcare")        

    var smokesLabel = chartGroup.append("text")
        .attr("transform", `rotate(-90)`)
        .attr("y", 0-margin.left + 30)
        .attr("x", 0 - chartHeight/2)
        .attr("value", "smokes")
        .attr("dy", "1em")
        .classed("active", false)
        .text("Smokes (%)")        

    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // Event Handler - Change the chart and X axis labels on click
    labelsGroup.selectAll("text")
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
                xAxis = render_XAxes(xLinearScale, xAxis);

                // Update the circles with new xaxis values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // Update the tooltip display based on the new selection
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // Change the style of the axis label as the selection changes
                switch(chosenXAxis) {
                    case "poverty":
                        povertyLabel
                            .classed("active", true)
                            // var circleLabel_P = chartGroup.selectAll(null).data(censusData)
                            // .enter()
                            // .append("text")        
                            // circleLabel_P.attr("x", function(d) {
                            //     return xLinearScale(d.poverty)
                            // })
                            // circleLabel_P.attr("y", function(d) {
                            //     return yLinearScale(d.healthcareLow)
                            // })
                            // .text(function (d){
                            //     return d.abbr;
                            // })
                            // .attr("font-family", "sans-serif")
                            // .attr("font-size", "10px")
                            // .attr("text-anchor", "middle")
                            // .attr("fill", "black");

                        ageLabel
                            .classed("inactive", true)
                            
                            circleLabel_A = chartGroup.selectAll("text")
                            .data(censusData)
                            .exit()
                            .remove()
                                
                           

                        break;
                    case "age":
                        ageLabel
                            .classed("active", true)

                            circleLabel_P = chartGroup.selectAll("text")
                                .data(censusData)
                                .exit()
                                .remove()                            

                            var circleLabel_A = chartGroup.selectAll(null).data(censusData)
                            .enter()
                            .append("text")        
                            circleLabel_A.attr("x", function(d) {
                                return xLinearScale(d.age)
                            })
                            circleLabel_A.attr("y", function(d) {
                                return yLinearScale(d.healthcareLow)
                            })
                            .text(function (d){
                                return d.age;
                            })
                            .attr("font-family", "sans-serif")
                            .attr("font-size", "10px")
                            .attr("text-anchor", "middle")
                            .attr("fill", "black");

                        povertyLabel
                            .classed("inactive", true)

                            // circleLabel_P = chartGroup.selectAll("text")
                            //     .data(censusData)
                            //     .exit()
                            //     .remove()
                            

                            break;
                    case "income":
                        povertyLabel
                            .classed("inactive", true)
                        ageLabel
                            .classed("inactive", true)
                        incomeLabel
                            .classed("active", true)
                        break;
                    default:
                        povertyLabel
                            .classed("active", true)
                        ageLabel
                            .classed("inactive", true)
                        break;
                }

                switch(chosenYAxis) {
                    case "obesity":
                        obesityLabel
                            .classed("active", true)
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
                        break;
                    default:
                        obesityLabel
                            .classed("inactive", true)
                        smokesLabel
                            .classed("inactive", true)
                        healthLabel
                            .classed("active", true)
                        break;
    
                    }
            }

        })

    // Event Handler - Change the chart and X axis labels on click
    yLabelsGroup.selectAll("text")
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
                xAxis = render_XAxes(xLinearScale, xAxis);

                // Update the circles with new xaxis values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // Update the tooltip display based on the new selection
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // Change the style of the axis label as the selection changes
                switch(chosenXAxis) {
                    case "poverty":
                        povertyLabel
                            .classed("active", true)
                            // var circleLabel_P = chartGroup.selectAll(null).data(censusData)
                            // .enter()
                            // .append("text")        
                            // circleLabel_P.attr("x", function(d) {
                            //     return xLinearScale(d.poverty)
                            // })
                            // circleLabel_P.attr("y", function(d) {
                            //     return yLinearScale(d.healthcareLow)
                            // })
                            // .text(function (d){
                            //     return d.abbr;
                            // })
                            // .attr("font-family", "sans-serif")
                            // .attr("font-size", "10px")
                            // .attr("text-anchor", "middle")
                            // .attr("fill", "black");

                        ageLabel
                            .classed("inactive", true)
                            
                            circleLabel_A = chartGroup.selectAll("text")
                            .data(censusData)
                            .exit()
                            .remove()
                                
                           

                        break;
                    case "age":
                        ageLabel
                            .classed("active", true)

                            circleLabel_P = chartGroup.selectAll("text")
                                .data(censusData)
                                .exit()
                                .remove()                            

                            var circleLabel_A = chartGroup.selectAll(null).data(censusData)
                            .enter()
                            .append("text")        
                            circleLabel_A.attr("x", function(d) {
                                return xLinearScale(d.age)
                            })
                            circleLabel_A.attr("y", function(d) {
                                return yLinearScale(d.healthcareLow)
                            })
                            .text(function (d){
                                return d.age;
                            })
                            .attr("font-family", "sans-serif")
                            .attr("font-size", "10px")
                            .attr("text-anchor", "middle")
                            .attr("fill", "black");

                        povertyLabel
                            .classed("inactive", true)

                            // circleLabel_P = chartGroup.selectAll("text")
                            //     .data(censusData)
                            //     .exit()
                            //     .remove()
                            

                            break;
                    case "income":
                        povertyLabel
                            .classed("inactive", true)
                        ageLabel
                            .classed("inactive", true)
                        incomeLabel
                            .classed("active", true)
                        break;
                    default:
                        povertyLabel
                            .classed("active", true)
                        ageLabel
                            .classed("inactive", true)
                        break;
                }

                switch(chosenYAxis) {
                    case "obesity":
                        obesityLabel
                            .classed("active", true)
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
                        break;
                    default:
                        obesityLabel
                            .classed("inactive", true)
                        smokesLabel
                            .classed("inactive", true)
                        healthLabel
                            .classed("active", true)
                        break;
    
                    }
            }

        })


}).catch(function (error) {
    console.log(error); 

});



// }



// // function used for updating y-scale var upon click on axis label
// function yScale(censusData, chosenYAxis) {
//     // create scales
//     var yLinearScale = d3.scaleLinear()
//         .domain([d3.min(censusData, d => d[chosenYAxis]) ,
//         d3.max(censusData, d => d[chosenYAxis])
//         ])
//         .range([height, 0]);
//     return yLinearScale;
// }

// // function used for updating Y Axis var upon click on axis label
// function render_YAxes(newYScale, yAxis) {
//     var leftAxis = d3.axisLeft(newYScale);
//     yAxis.transition()
//         .duration(1000)
//         .call(leftAxis);
//     return yAxis;
// }






//     // id,state,abbr,,povertyMoe,,ageMoe,,incomeMoe,healthcare,,healthcareHigh,
//     //,obesityLow,obesityHigh,,smokesLow,smokesHigh,-0.385218228

// var dataFile = "./assets/data/data.csv"

//     // Function to display the chart based on the axis label clicked
// d3.csv(dataFile).then(function (censusData, err) {

//     var lowHealthcare = censusData.map(data => +data.healthcareLow);
//     var poverty = censusData.map(data => +data.poverty);
//     var age = censusData.map(data => +data.age);
//     var income = censusData.map(data => +data.income);
//     var smokes = censusData.map(data => +data.smokes);
//     var obesity = censusData.map(data => +data.obesity);

//     console.log(`healthcareLow:   ${lowHealthcare}`);
//     console.log(`poverty:   ${poverty}`);
//     console.log(`age:   ${age}`);
//     console.log(`income:   ${income}`);
//     console.log(`smokes:   ${smokes}`);
//     console.log(`obesity:${obesity}`);

//     // censusData.forEach(function (data) {
//     //     data.healthcareLow = +data.healthcareLow;
//     //     data.poverty = +data.poverty;            
//     //     data.age = +data.age;
//     //     data.income = +data.income;
//     //     data.smokes = +data.smokes;
//     //     data.obesity = +data.obesity;

//     //     console.log(`healthcareLow:   ${data.healthcareLow}`);
//     //     console.log(`poverty:   ${data.poverty}`);
//     //     console.log(`age:   ${data.age}`);
//     //     console.log(`income:   ${data.income}`);
//     //     console.log(`smokes:   ${data.smokes}`);
//     //     console.log(`obesity:${data.obesity}`);
//     // });


//     // Define X axis linear scale
//     var xLinearScale = xScale(censusData, selectedXAxis);
//     // Define Y axis linear scale
//     var yLinearScale = yScale(censusData, selectedYAxis);

//     // Create initial axis functions
//     var bottomAxis = d3.axisBottom(xLinearScale);
//     var leftAxis = d3.axisLeft(yLinearScale);

//     // append x axis
//     var xAxis = chartGroup.append("g")
//         .attr("transform", `translate(0, ${height})`)
//         .call(bottomAxis);    

//     // append x axis
//     var yAxis = chartGroup.append("g")
//         .attr("transform", `translate(0, ${width})`)
//         .call(leftAxis);

//     // // append y axis
//     // chartGroup.append("g")
//     //     .call(leftAxis);

//     // append initial circles
//     var circlesGroup = chartGroup.selectAll("circle")
//         .data(censusData)
//         .enter()
//         .append("circle")
//         .attr("cx", d => xLinearScale(d[selectedYAxis]))
//         .attr("cy", d => yLinearScale(d[selectedYAxis]))
//         .attr("text-anchor", "TT")
//         .attr("fill", "pink")
//         .attr("r", 20);        

//         var circlesGroup = updateToolTip(selectedXAxis, selectedYAxis, circlesGroup);        
// });

// // When the browser loads, makeResponsive() is called.
// // makeResponsive();

// // When the browser window is resized, responsify() is called.
// // d3.select(window).on("resize", makeResponsive);