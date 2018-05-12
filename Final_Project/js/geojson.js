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
	getMonument(map);
	getData(map);
	getMinData(map);
	getOilData(map);
	
};




function pointToLayerOil(feature, latlng){
	
	//determine which attribute will be visualized
	var attribute = "Name";
	
	//creat marker options
	var options = {
		radius: 1,
				fillColor: "#010800",
				color:"#010800",
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8
			};
	//create circle marker layer
	var layerOil = L.circleMarker(latlng, options);
	
	return layerOil;
	
};


//add markers
function createOilSymbols (data, map){
	//create Leaflet GeoJSON layer and add it to map
	L.geoJSON(data, {
		pointToLayer: pointToLayerOil
	}).addTo(map);
};



function getOilData(map){
	//load data
	$.ajax("data/oilGas_FocusNM.geojson",{
		dataType: "json",
		success: function(response){
			createOilSymbols(response, map);
		
		}
	});
};
























function pointToLayerMineral(feature, latlng){
	
	//determine which attribute will be visualized
	var attribute = "Name";
	
	//creat marker options
	var options = {
		radius: 1,
				fillColor: "#3399FF",
				color:"#3399FF",
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8
			};
	//create circle marker layer
	var layerMin = L.circleMarker(latlng, options);
	
	return layerMin;
	
};


//add markers
function createMinSymbols (data, map){
	//create Leaflet GeoJSON layer and add it to map
	L.geoJSON(data, {
		pointToLayer: pointToLayerMineral
	}).addTo(map);
};



function getMinData(map){
	//load data
	$.ajax("data/min_FocusNM.geojson",{
		dataType: "json",
		success: function(response){
			createMinSymbols(response, map);
		
		}
	});
};






















function pointToLayer(feature, latlng){
	
	//determine which attribute will be visualized
	var attribute = "Name";
	
	//creat marker options
	var options = {
				radius: 1,
				fillColor: "#FF5733",
				color:"#FF5733",
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8
			};
	//create circle marker layer
	var layer = L.circleMarker(latlng, options);
	
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
	$.ajax("data/points_FocusNM.geojson",{
		dataType: "json",
		success: function(response){
			createSymbols(response, map);
		
		}
	});
};














function getMonument(map){
	//load data
	$.ajax("data/nationalMonumentsTime.geojson",{
	dataType: "json",
	success: function(response){
	var testLayer = L.geoJson(response, {
		onEachFeature: function(feature, layer) {
			layer.bindPopup("<p><b>National Monument: </b> " + feature.properties.name + "</p>" +"<p><b>Year Established: </b>" + feature.properties.year + "</p> " + "<p><b>Area (acres): </b>" + feature.properties.area + "</p>");
			layer.on({
				mouseover: function(){
					this.openPopup();
				},
				mouseout: function(){
					this.closePopup();
				}
			});
		}
	});
	
	var sliderControl = L.control.sliderControl({
		position: "topright",
		layer: testLayer,
		timeAttribute: "time",
		isTime: true,
		startTime: '1906-09-24T00:00:00',
		endTime: '2017-01-13T00:00:00',
		range: true
	});
	map.addControl(sliderControl);
	sliderControl.startSlider();
	}
	});
};



$(document).ready(createMap);




