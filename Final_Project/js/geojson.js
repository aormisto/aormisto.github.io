//Anna Ormiston: Final Project */
//function to instantiate the Leaflet map
function createMap(){
// Library used: https://github.com/Norkart/Leaflet-MiniMap/tree/master/example
	var map = new L.Map('map');
	

		
	
	
	
	
	
	
	
	
	
	
	var min = new L.GeoJSON.AJAX("data/min_FocusNM.geojson", {
		pointToLayer: function(feature, latlng) {
			return new L.CircleMarker(latlng, {
				radius: 3,
				fillColor: "#626567",
				color:"#626567",
				weight: 1,
				opacity: 1,
				fillOpacity: 0.5
			});
    	},
		onEachFeature: function (feature, layer) {
        layer.bindPopup("<b>Mineral Type: </b> " + feature.properties.ORE_MAT);
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
	
	var oilGas = new L.GeoJSON.AJAX("data/oilGas_FocusNM.geojson", {
		pointToLayer: function(feature, latlng) {
        	return new L.CircleMarker(latlng, {
				radius: 3,
				fillColor: "#000",
				color:"#000",
				weight: 1,
				opacity: 1,
				fillOpacity: 0.7
			});
    	},
		onEachFeature: function (feature, layer) {
        layer.bindPopup("<b>Oil and Gas Operator: </b> " + feature.properties.Operator);
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
	
	var points = new L.GeoJSON.AJAX("data/points_FocusNM.geojson", {
		pointToLayer: function(feature, latlng) {
        	return new L.CircleMarker(latlng, {
				radius: 3,
				fillColor: "#2471A3",
				color:"#2471A3",
				weight: 1,
				opacity: 1,
				fillOpacity: 0.5
			});
    	},
		onEachFeature: function (feature, layer) {
        layer.bindPopup("<b>Significant Point of Interest: </b> " + feature.properties.Name);
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
	
	
	
	var overlayMaps = {
		"Mineral Extraction Sites": min,
		"Oil and Gas Extraction Sites": oilGas,
		"Significant Points of Interest": points
		
	};
	L.control.layers(null, overlayMaps).addTo(map);
	
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
	
};










function getMonument(map){
	//load data
	$.ajax("data/nationalMonumentsTime.geojson", {
	dataType: "json",
	success: function(response){
	var testLayer = L.geoJson(response, {
		pointToLayer: function(feature, latlng) {
        return new L.CircleMarker(latlng, {
				radius: 8,
				fillColor: "#0E6655",
				color:"#0E6655  ",
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8});
    	},
		
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
		testLayer.on('click', function(response) {
			map.setView(response.latlng, 10);
		});
		
	
	var sliderControl = L.control.sliderControl({
		position: "topright",
		layer: testLayer,
		timeAttribute: 'time',
		isTime: true,
		startTime: '1906-09-24T00:00:00',
		endTime: '2017-01-13T00:00:00',
		range: true
		
	});
		
	map.addControl(sliderControl);
	
	sliderControl.startSlider();
		$('#slider-timestamp').html(options.markers[ui.value].feature.properties.time.substr(0, 10));
		
		
	}
	});
};



$(document).ready(createMap);




