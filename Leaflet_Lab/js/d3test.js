//begin script when window loads
window.onload = setMap();
//Example 1.4 line 1...set up choropleth map
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

    //create Albers equal area conic projection centered on France
    var projection = d3.geoAlbers()
        .center([0, 46.2])
        .rotate([-2, 0, 0])
        .parallels([43, 62])
        .scale(2500)
        .translate([width / 2, height / 2]);
    d3.queue()
        .defer(d3.csv, "data/unitsData.csv") //load attributes from csv
        .defer(d3.json, "data/EuropeCountries.topojson") //load background spatial data
        .defer(d3.json, "data/FranceProvinces.topojson") //load choropleth spatial data
        .await(callback);

       //Example 1.4 line 10
    function callback(error, csvData, europe, france){
        //translate europe TopoJSON
        var europeCountries = topojson.feature(europe, europe.objects.EuropeCountries),
            franceRegions = topojson.feature(france, france.objects.FranceRegions).features;

        //examine the results
        console.log(europeCountries);
        console.log(franceRegions);
    };