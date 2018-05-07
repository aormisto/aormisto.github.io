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
function pointToLayer(feature, latlng, attributes){
	
	//determine which attribute will be visualized
	var attribute = attributes[0];
	
	//check
	console.log(attribute);
	
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
	layer.bindPopup(popupContent, {
		offset: new L.point(0,-options.radius)
	});
	
	//event listeners to open popup on hover
	layer.on({
		mouseover: function(){
			this.openPopup();
		},
		mouseout: function(){
			this.closePopup();
		}
	});
	
	//return the marker to the L.geoJson pointLater option
	return layer;
};

//create new sequence controls
function createSequenceControls(map){
	//create range input element (slider)
	$('#panel').append('<input class="range-slider" type="range">');
	//set slider attributes
	$('.range-slider').attr({
		max: 52,
		min: 0,
		value: 0,
		step: 1
	});
	
	$('#panel').append('<button class="skip" id="reverse">Reverse</button>');
	$('#panel').append('<button class="skip" id="forward">Skip</button>');
	$('#reverse').html('<img src="img/back.png">');
	$('#forward').html('<img src="img/forward.png">');
	
	//click listener for buttons
	$('.skip').click(function(){
		
		//get the old index value
		var index = $('.range-slider').val();
		
		//increment or decrement depending on button clicked
		if($(this).attr('id') == 'forward'){
			index++;
			
			//if past the last attribute, wrap around to first attribute
			index = index > 52 ? 0 : index;
			
		} else if ($(this).attr('id') == 'reverse'){
			index--;
			//if past the first attribute, wrap around to last attribute
			index = index < 0 ? 52 : index;
		};
		
		//update slider
		$('.range-slider').val(index);
		updateSymbols(map, attributes[index]);
	});
	
	//input listener for slider
	$('.range-slider').on('input', function(){
		//get the new index value
		var index = $(this).val();
		updateSymbols(map, attributes[index]);
	});
	
};


//add markers
function createSymbols (data, map, attributes){
	//create Leaflet GeoJSON layer and add it to map
	L.geoJSON(data, {
		pointToLayer: function(feature, latlng){
			return pointToLayer(feature, latlng, attributes);
		}
	}).addTo(map);
};

//build attribute array of data
function processData(data){
	//empty array to hold attributes
	var attributes = [];
	
	//properties of the first feature in the dataset
	var properties = data.features[0].properties;
	
	//push each attribute name into attributes array
	for (var attribute in properties){
		//only take attributes with population values
		if (attribute.indexOf("year") > -1){
			attributes.push(attribute);
		};
	};
	
	//check result
	console.log(attributes);
	
	return attributes;
};

//Resize proportional symbols according to new attribute values
function updateSymbols(map, attribute){
     map.eachLayer(function(layer){
      
         if (layer.feature && layer.feature.properties[attribute]){
            //update the layer style and popup
           
         };
     });
};



		
function getData(map){
	//load data
	$.ajax("data/natmon.geojson", {
		dataType: "json",
		success: function(response){
			
			//create attributes array
			var attributes = processData(response);
			
			//call functions to create symbols
			createSymbols(response, map, attributes);
			createSequenceControls(map, attributes);
		}
		
	});
};

$(document).ready(createMap);