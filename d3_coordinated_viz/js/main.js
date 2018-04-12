//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

//pseudo-global variables
var attrArray = ["Total CO2 Emissions Excluding Land-Use Change and Forestry (MtCO2)", "Total GHG Emissions Excluding Land-Use Change and Forestry (MtCO2e)", "Total GHG Emissions Including Land-Use Change and Forestry (MtCO2e)", "Population (people)", "Total GHG Emissions Excluding Land-Use Change & Forestry Per Capita (tCO2e Per Capita)", "Total GHG Emissions Including Land-Use Change & Forestry Per Capita (tCO2e Per Capita)", "GDP-PPP (Million Intl$ (2011))", "GDP-USD (Million US$ (2010))", "Energy (MtCO2e)", "Industrial Processes (MtCO2e)", "Agriculture (MtCO2e)", "Waste (MtCO2e)", "Land-Use Change and Forestry (MtCO2)", "Bunker Fuels (MtCO2)"]; //list of attributes
var expressed = attrArray[0]; //initial attribute

//chart frame dimensions
var chartWidth = window.innerWidth * 0.425,
    chartHeight = 473,
    leftPadding = 50,
    rightPadding = 2,
    topBottomPadding = 5,
    chartInnerWidth = chartWidth - leftPadding - rightPadding,
    chartInnerHeight = chartHeight - topBottomPadding * 2,
    translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

//create a scale to size bars proportionally to frame and for axis
var yScale = d3.scaleLinear()
    .range([463, 0])
    .domain([0, 11500]);		
	
//begin script when window loads    
window.onload = setMap();

//set up choropleth map 
function setMap(){

    //map frame dimensions
    var width = window.innerWidth * 0.5,
        height = 460;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Mollweide equal area projection 
    var projection = d3.geoMollweide()
        .center([0, -6])
        .scale(160);
 
    
    var path = d3.geoPath()
            .projection(projection);
    
    //use queue to parallelize asynchronous data loading
    d3.queue()
        .defer(d3.csv, "data/data.csv") //load attributes from csv
        .defer(d3.json, "data/World_Countries1.topojson") //load background spatial data
        .defer(d3.json, "data/countries.topojson") //load choropleth spatial data
        .await(callback);
    
    
    function callback(error, csvData, world, climate){
        
        //place graticule on the map
        setGraticule(map, path);
        
        //translate world and climate countries to TopoJSON
        var worldCountries = topojson.feature(world, world.objects.World_Countries1),
            climateRegions = topojson.feature(climate, climate.objects.countries).features;
        
         //add world countries to map
        var countries = map.append("path")
            .datum(worldCountries)
            .attr("class", "countries")
            .attr("d", path);
        
        //join csv data to GeoJSON enumeration units
            climateRegions = joinData(climateRegions, csvData);

         //create the color scale
        var colorScale = makeColorScale(csvData);
        
        //add enumeration units to the map
        setEnumerationUnits(climateRegions, map, path, colorScale);
		
		 //add coordinated visualization to the map
        setChart(csvData, colorScale);	
		
		//add dropdown
		createDropdown(csvData)
    };
}; //end of setMap()    

	 
function setGraticule(map, path){
    //...GRATICULE BLOCKS FROM PREVIOUS MODULE
    var graticule = d3.geoGraticule()
            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude
        
        //create graticule background
        var gratBackground = map.append("path")
            .datum(graticule.outline()) //bind graticule background
            .attr("class", "gratBackground") //assign class for styling
            .attr("d", path) //project graticule

        //create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines
    
};
        
function joinData(climateRegions, csvData){
    
        //loop through csv to assign each set of csv attribute values to geojson region
        for (var i=0; i<csvData.length; i++){
            var csvRegion = csvData[i]; //the current region
            var csvKey = csvRegion.ADMIN; //the CSV primary key

            //loop through geojson regions to find correct region
            for (var a=0; a<climateRegions.length; a++){

                var geojsonProps = climateRegions[a].properties; //the current region geojson properties
                var geojsonKey = geojsonProps.ADMIN; //the geojson primary key

                //where primary keys match, transfer csv data to geojson properties object
                if (geojsonKey == csvKey){

                    //assign all attributes and values
                    attrArray.forEach(function(attr){
                        var val = parseFloat(csvRegion[attr]); //get csv attribute value
                        geojsonProps[attr] = val; //assign attribute and value to geojson properties
                    });
                };
            };
        };
    
    return (climateRegions);

};

function setEnumerationUnits(climateRegions, map, path, colorScale){
    //...REGIONS BLOCK FROM PREVIOUS MODULE
    
     //add countries with climate change data to map
        var regions = map.selectAll(".regions")
        .data(climateRegions)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "regions " + d.properties.ADMIN;
        })
        .attr("d", path)
       .style("fill", function(d){
            return choropleth(d.properties, colorScale);
        })
		.on("mouseover", function(d){
            highlight(d.properties);
        })
		.on("mouseout", function(d){
            dehighlight(d.properties);
        })
		.on("mousemove", moveLabel);


	
	//add style descriptor to each path
		var desc = regions.append("desc")
			.text('{"stroke": "#000", "stroke-width": "0.5px"}');
};

    //function to create color scale generator
function makeColorScale(data){
    var colorClasses = [
        "#fef0d9",
        "#fdcc8a",
        "#fc8d59",
        "#e34a33",
        "#b30000"
    ];

    //create color scale generator
    var colorScale = d3.scaleThreshold()
        .range(colorClasses);

    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };

    //cluster data using ckmeans clustering algorithm to create natural breaks
     var clusters = ss.ckmeans(domainArray, 5);
    //reset domain array to cluster minimums
    domainArray = clusters.map(function(d){
        return d3.min(d);
    });
    //remove first value from domain array to create class breakpoints
    domainArray.shift();

    //assign array of last 4 cluster minimums as domain
    colorScale.domain(domainArray);
    return colorScale;
};
    
    //function to test for data value and return color
function choropleth(props, colorScale){
    //make sure attribute value is a number
    var val = parseFloat(props[expressed]);
        //if attribute value exists, assign a color; otherwise assign gray
        if (typeof val == 'number' && !isNaN(val)){
            return colorScale(val);
        } else {
            return "#CCC";
        };
};
	
	//function to create coordinated bar chart
function setChart(csvData, colorScale){
    
    //create a second svg element to hold the bar chart
      var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");
	
	//create a rectangle for chart background fill
    var chartBackground = chart.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);

	
    //set bars for each province
   var bars = chart.selectAll(".bar")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return b[expressed]-a[expressed]
        })
        .attr("class", function(d){
            return "bar " + d.ADMIN;
        })
        .attr("width", chartInnerWidth / csvData.length - 1)
   		.on("mouseover", highlight)
		.on("mouseout", dehighlight)
        .on("mousemove", moveLabel);

	
	 //add style descriptor to each rect
	var desc = bars.append("desc")
        .text('{"stroke": "none", "stroke-width": "0px"}');
	
	//create a text element for the chart title
    var chartTitle = chart.append("text")
        .attr("x", 40)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text("Number of Variable " + expressed[3] + " in each region");

    //create vertical axis generator
    var yAxis = d3.axisLeft()
        .scale(yScale);

    //place axis
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

    //create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);
	
	//set bar positions, heights, and colors
    updateChart(bars, csvData.length, colorScale);
}; //end of setChart()

//function to create a dropdown menu for attribute selection
function createDropdown(csvData){
    //add select element
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown")
		.on("change", function(){
            changeAttribute(this.value, csvData)
        });

    //add initial option
    var titleOption = dropdown.append("option")
        .attr("class", "titleOption")
        .attr("disabled", "true")
        .text("Select Attribute");

    //add attribute name options
    var attrOptions = dropdown.selectAll("attrOptions")
        .data(attrArray)
        .enter()
        .append("option")
        .attr("value", function(d){ return d })
        .text(function(d){ return d });
};	

//dropdown change listener handler
function changeAttribute(attribute, csvData){
    //change the expressed attribute
    expressed = attribute;

    //recreate the color scale
    var colorScale = makeColorScale(csvData);

    //recolor enumeration units
    var regions = d3.selectAll(".regions")
        .transition()
        .duration(1000)
        .style("fill", function(d){
            return choropleth(d.properties, colorScale)
        });

    //re-sort, resize, and recolor bars
     var bars = d3.selectAll(".bar")
        //re-sort bars
        .sort(function(a, b){
            return b[expressed] - a[expressed];
        })
        .transition() //add animation
        .delay(function(d, i){
            return i * 20
        })
        .duration(500);
	
	// Create an array that containing all values of the expressed attribute
	var changeArray = [];
	for (var i=0; i<csvData.length; i++) {
		var val = parseFloat(csvData[i][expressed]);
		changeArray.push(val);
	};
	
	//Find the max value of the array (using d3.min(array) method)
	var maxValue = d3.max(changeArray);
	
	//Use that value to set a new y scale (like what you did in your global yScalePop block)
	
	yScale = d3.scaleLinear()
		.range([chartHeight, 0])
		.domain([0, maxValue]);
	
	var yAxis = d3.axisLeft()
		.scale(yScale);
	
	d3.selectAll("g.axis")
		.call(yAxis);
	 
  updateChart(bars, csvData.length, colorScale);
}; //end of changeAttribute()
	
//function to position, size, and color bars in chart
function updateChart(bars, n, colorScale){
    //position bars
    bars.attr("x", function(d, i){
            return i * (chartInnerWidth / n) + leftPadding;
        })
        //size/resize bars
        .attr("height", function(d, i){
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        //color/recolor bars
        .style("fill", function(d){
            return choropleth(d, colorScale);
        });	
	//add text to chart title
    var chartTitle = d3.select(".chartTitle")
        .text(expressed + " in each region");
};
	
 //function to highlight enumeration units and bars
function highlight(props){
    //change stroke
    var selected = d3.selectAll("." + props.ADMIN)
        .style("stroke", "#ffff1a")
        .style("stroke-width", "2");
	
	setLabel(props)
};	
	
	//function to reset the element style on mouseout
function dehighlight(props){
    var selected = d3.selectAll("." + props.ADMIN)
        .style("stroke", function(){
            return getStyle(this, "stroke")
        })
        .style("stroke-width", function(){
            return getStyle(this, "stroke-width")
        });

    function getStyle(element, styleName){
        var styleText = d3.select(element)
            .select("desc")
            .text();

        var styleObject = JSON.parse(styleText);

        return styleObject[styleName];
    }
	//remove info label
    d3.select(".infolabel")
        .remove();
	
};
	
	
	//function to create dynamic label
function setLabel(props){
    //label content
    var labelAttribute = "<h1>" + props[expressed] +
        "</h1><b>" + expressed + "</b>";

    //create info label div
    var infolabel = d3.select("body")
        .append("div")
        .attr("class", "infolabel")
        .attr("id", props.ADMIN + "_label")
        .html(labelAttribute);

    var regionName = infolabel.append("div")
        .attr("class", "labelname")
        .html(props.ADMIN);
};
	
//function to move info label with mouse
function moveLabel(){
    //get width of label
    var labelWidth = d3.select(".infolabel")
        .node()
        .getBoundingClientRect()
        .width;

    //use coordinates of mousemove event to set label coordinates
    var x1 = d3.event.clientX + 10,
        y1 = d3.event.clientY - 75,
        x2 = d3.event.clientX - labelWidth - 10,
        y2 = d3.event.clientY + 25;

    //horizontal label coordinate, testing for overflow
    var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
    //vertical label coordinate, testing for overflow
    var y = d3.event.clientY < 75 ? y2 : y1; 

    d3.select(".infolabel")
        .style("left", x + "px")
        .style("top", y + "px");
};
	
})(); //last line of main.js    

jQuery('#mydiv').html('<b>Greenhouse gases (GHGs) trap heat and increase the temperature of our atmosphere causing climate change. Anthropogenic activities since the industrial revolution have increased GHG emissions, driving increase in ocean temperatures, sea level rise and acidification, increase in storm events, increase global surface temperatures, increase in drought, and decrease in seasonal polar ice. Explore the many attributes that explain this complex issue including total CO2 emissions, total GHG emissions with and without land-use change and forestry (raw and per capita), population size, gross domestic product (US dollar and international purchasing power parity)  from 2014.Which sector (Energy, Industrial Processes, Agriculture, Waste, Land-use Change and Forestry, and Bunker Fuels) produces the most GHG emissions for each country? Which produces the least GHG emission for each country?</b>');

