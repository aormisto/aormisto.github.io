function jQueryAjax(){
    //define a variable to hold the data
    var mydata;

    //basic jQuery ajax method
    $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function(response){
            mydata = response;

            //check the data
            console.log(mydata);
        }
    });

};

$(document).ready(jQueryAjax);

function debugCallback(response){
    
    $(mydiv).append('GeoJSON data: ' + JSON.stringify(mydata));
};

function debugAjax(){
    
    var mydata;

    $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function(response){
            
            debugCallback(mydata);
        }
    });

    $(mydiv).append('<br>GeoJSON data:<br>' + JSON.stringify(mydata));
};