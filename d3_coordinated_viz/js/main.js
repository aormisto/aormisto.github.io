window.onload = setMap();

function setMap(){

    //map frame dimensions
    var width = 960,
        height = 460;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection 
    var projection = d3.geoAlbers()
        .center([0, 0])
        .rotate([-2, 0, 0])
        .parallels([43, 62])
        .scale(2500)
        .translate([width / 2, height / 2]);
	
	var path = d3.geoPath()
			.projection(projection);
	
    //use queue to parallelize asynchronous data loading
    d3.queue()
        .defer(d3.csv, "data/data.csv") //load attributes from csv
        .defer(d3.json, "data/WorldCountries.topojson") //load background spatial data
        .defer(d3.json, "data/countries.topojson") //load choropleth spatial data
        .await(callback);
	
	function callback(error, csvData, world, climate){
        //translate europe TopoJSON
        var worldCountries = topojson.feature(world, world.objects.WorldCountries),
            climateRegions = topojson.feature(climate, climate.objects.countries).features;

               //add Europe countries to map
        var countries = map.append("path")
            .datum(worldCountries)
            .attr("class", "countries")
            .attr("d", path);

        //add France regions to map
        var regions = map.selectAll(".regions")
            .data(climateRegions)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "regions " + d.properties.ADMIN;
            })
            .attr("d", path);
    };
	
};