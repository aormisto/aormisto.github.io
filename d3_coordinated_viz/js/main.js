window.onload = setMap();

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

    //create Albers equal area conic projection 
    var projection = d3.geoAlbers()
        .center([15, 30])
        .rotate([-2, 0, 0])
        .parallels([15, 15])
        .scale(250)
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
		
        //translate world and climate countries to TopoJSON
        var worldCountries = topojson.feature(world, world.objects.WorldCountries),
            climateRegions = topojson.feature(climate, climate.objects.countries).features;
		
		
			//variables for data join
		var attrArray = ["varA", "varB", "varC", "varD", "varE", "varF", "varG", "varH", "varI", "varJ", "varK", "varL", "varM", "varN"];

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
		
               //add world countries to map
        var countries = map.append("path")
            .datum(worldCountries)
            .attr("class", "countries")
            .attr("d", path);

        //add countries with climate change data to map
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