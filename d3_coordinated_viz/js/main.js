//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

//pseudo-global variables
var attrArray = ["varA", "varB", "varC", "varD", "varE", "varF", "varG", "varH", "varI", "varJ", "varK", "varL", "varM", "varN"]; //list of attributes
var expressed = attrArray[0]; //initial attribute

//begin script when window loads    
window.onload = setMap();

//set up choropleth map 
function setMap(){

    //map frame dimensions
    var width = 1600,
        height = 800;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Mollweide equal area projection 
    var projection = d3.geoMollweide()
        .center([0, 0])
        .scale(200);
 
    
    var path = d3.geoPath()
            .projection(projection);
    
    //use queue to parallelize asynchronous data loading
    d3.queue()
        .defer(d3.csv, "data/data.csv") //load attributes from csv
        .defer(d3.json, "data/WorldCountries.topojson") //load background spatial data
        .defer(d3.json, "data/countries.topojson") //load choropleth spatial data
        .await(callback);
    
    
    function callback(error, csvData, world, climate){
        
        //place graticule on the map
        setGraticule(map, path);
        
        //translate world and climate countries to TopoJSON
        var worldCountries = topojson.feature(world, world.objects.WorldCountries),
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
        });
};

    //function to create color scale generator
function makeColorScale(data){
    var colorClasses = [
        "#D4B9DA",
        "#C994C7",
        "#DF65B0",
        "#DD1C77",
        "#980043"
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
    
                
})(); //last line of main.js    