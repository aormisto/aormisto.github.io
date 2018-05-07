//Anna Ormiston: Final Project */

//function to instantiate the Leaflet map
function createMap(){
   // Library used: https://github.com/Norkart/Leaflet-MiniMap/tree/master/example

var map = new L.Map('map');
		var osmUrl='https://api.mapbox.com/styles/v1/aormisto/cjdzbihla1gtr2tq7c8e6kx1x/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW9ybWlzdG8iLCJhIjoiY2pkemFkcW1wNWY3aDJ4cDBybnp0OHI4cCJ9.5KX05b-V3tmUBACjkVyMMg';
		var osmAttrib='Map data &copy; OpenStreetMap contributors';
		var osm = new L.TileLayer(osmUrl, {minZoom: 3, maxZoom: 15, attribution: osmAttrib});
		map.addLayer(osm);
		map.setView(new L.LatLng(40, -100),4);
		
  
		//THE FIFTH OPERATOR: Plugin magic goes here! Note that you cannot use the same layer object again, as that will confuse the two map controls
		var osm2 = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: 13, attribution: osmAttrib });
		var miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true }).addTo(map);

    //call getData function
    getData(map);
}

//convert markers to circle markers
function pointToLayer(feature, latlng){
	
	//determine which attribute will be visualized
	var attribute = "area";
	
	//creat marker options
	var options = {
		radius: 8,
				fillColor: "#FF5733",
				color:"#000",
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8
			};
	//create circle marker layer
	var layer = L.circleMarker(latlng, options);
	
	//build popup string
	var popupContent = "<p><b>National Monument: </b> " + feature.properties.name + "</p>" +"<p><b>Year Established: </b>" + feature.properties.year + "</p> " + "<p><b>Area (acres): </b>" + feature.properties.area + "</p>";
	
	//bind popup to circle marker
	layer.bindPopup(popupContent);
	
	//return the marker to the L.geoJson pointLater option
	return layer;
};


//add markers
function createSymbols (data, map){
	//create Leaflet GeoJSON layer and add it to map
	L.geoJSON(data, {
		pointToLayer: pointToLayer
	}).addTo(map);
};
	
		
function getData(map){
	//load data
	$.ajax("data/natmon.geojson", {
		dataType: "json",
		success: function(response){
			//call functions to create symbols
			createSymbols(response, map);
		}
		
	});
};

$(document).ready(createMap);