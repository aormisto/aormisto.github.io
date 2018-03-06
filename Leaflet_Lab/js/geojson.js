//Anna Ormiston: Lab 1: Leaflet Lab */

//function to instantiate the Leaflet map
function createMap(){
   // Library used: https://github.com/Norkart/Leaflet-MiniMap/tree/master/example

var map = new L.Map('map');
		var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		var osmAttrib='Map data &copy; OpenStreetMap contributors';
		var osm = new L.TileLayer(osmUrl, {minZoom: 3, maxZoom: 15, attribution: osmAttrib});
		map.addLayer(osm);
		map.setView(new L.LatLng(40, -100),4);
		
  
		//THE FIFTH OPERATOR: Plugin magic goes here! Note that you cannot use the same layer object again, as that will confuse the two map controls
		var osm2 = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: 13, attribution: osmAttrib });
		var miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true }).addTo(map);

    //call getData function
    getData(map);
};

//calculate radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 50;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

//Calculate the max, mean, and min values for a given attribute

function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};


function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //Example 3.5 line 15...Step 1: start attribute legend svg string
                var svg = '<svg id="attribute-legend" width="160px" height="60px">';

                    //Example 3.6 line 4...array of circle names to base loop on
                //object to base loop on...replaces Example 3.10 line 1
                    var circles = {
                        max: 20,
                        mean: 40,
                        min: 60
                    };

                    //loop to add each circle and text to svg string
                    for (var circle in circles){
                        //circle string
                        svg += '<circle class="legend-circle" id="' + circle + '" fill="#938fab" fill-opacity="0.8" stroke="#000000" cx="30"/>';
                        

                        //text string
                        svg += '<text id="' + circle + '-text" x="65" y="' + circles[circle] + '"></text>';
                    };

                //close svg string
                svg += "</svg>";

                //add attribute legend svg to container
                $(container).append(svg);

            return container;
        }
    });

    map.addControl(new LegendControl());

    updateLegend(map, attributes[0]);
    
};


//Example 3.7 line 1...Update the legend with new attribute
function updateLegend(map, attribute){
    //create content for legend
    var year = attribute.split("_")[1];
    var content = "PM<sub>2.5</sub> mean conc. for " + year;

    //replace legend content
    $('#temporal-legend').html(content);

    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);
     for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        $('#'+key).attr({
            cy: 59 - radius,
            r: radius
        });

        //Step 4: add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + " µg/m3");
    };
    
};

//Create Sequence Controls Function
function createSequenceControls(map, attributes){
     var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

         onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');


            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');

            //add skip buttons
            $(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');
             
             //kill any mouse event listeners on the map
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });
             
            return container;
        }
    });

    map.addControl(new SequenceControl());
   

    
    //Example 3.6: replace button content with images
    $('#reverse').html('<img src="img/back.png">');
    $('#forward').html('<img src="img/forward.png">');
    
    
    //Step 5: click listener for buttons
   //Example 3.14 Example 3.12 line 2...Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 8 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 8 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);
        updatePropSymbols(map, attributes[index]);
        updateLegend(map, attributes[index]);

});

    
 //Example: 3.13 Example 3.12 line 7...Step 5: input listener for slider
 $('.range-slider').on('input', function(){
     //Step 6: get the new index value
     var index = $(this).val();
     console.log(index);
     updatePropSymbols(map, attributes[index]);
     updateLegend(map, attributes[index]);
});
    //EX 3.4: set slider attributes
    $('.range-slider').attr({
        max: 8,
        min: 0,
        value: 0,
        step: 1
    });
};

//function to retrieve the data and place it on the map
//Example 3.8 line 8...load the data
//Above Example 3.8...Step 3: build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("PM25") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
    
};

//create Popup function
function createPopup(properties, attribute, layer, radius){
    //add city to popup content string
    var popupContent = "<p><b>City:</b> " + properties.City + "</p>";
       
    //add formatted attribute to panel content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>PM<sub>2.5</sub> " + year + ":</b> " + properties[attribute] + " µg/m<sup>3</sup></p>";

    //replace the layer popup
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-radius)
    });
};


//Example 3.11: Example 2.1 line 1...function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Step 4: Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];
    //check
    console.log(attribute);

    //create marker options
    var options = {
        fillColor: "#938fab",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
  
    //popup content is now just the city name
    createPopup(feature.properties, attribute, layer, options.radius);
    
    //event listeners to open popup on hover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        }
    });
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
//Example 3.10: Example 2.1 line 34...Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//Example 3.16: Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
     map.eachLayer(function(layer){
        //3.17:Example 3.16 line 4
         if (layer.feature && layer.feature.properties[attribute]){
             //access feature properties
             var props = layer.feature.properties;
             
             //update each feature's radius based on new attribute values
             var radius = calcPropRadius(props[attribute]);
             layer.setRadius(radius);
             
             
             createPopup(props, attribute, layer, radius);
           
         };
     });
};

//Import GeoJson data
function getData(map){
    //load the data
    $.ajax("data/citiesAirPollution.geojson", {
        dataType: "json",
        success: function(response){
            //create an attributes array
            var attributes = processData(response);

            //call function to creat proportional symbols
            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);
                updatePropSymbols(map, attributes);
            createLegend(map,attributes);
         
    }
 });
};
$(document).ready(createMap);