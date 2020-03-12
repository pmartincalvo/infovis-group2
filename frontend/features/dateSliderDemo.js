var minDate = "2015-02-01";
var maxDate = "2015-07-01";
askForClusters();

$("#my-time-slider").dateRangeSlider()

$("#my-time-slider").bind("valuesChanged", function(e, data){
	minDate = data.values.min.toISOString().slice(0, 10);
	maxDate = data.values.max.toISOString().slice(0, 10);
	askForClusters();
});