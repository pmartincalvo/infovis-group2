var minDate;
var maxDate;


$("#my-time-slider").dateRangeSlider()

$("#my-time-slider").bind("valuesChanged", function(e, data){
	minDate = data.values.min.toISOString().slice(0, 10);
	maxDate = data.values.max.toISOString().slice(0, 10);
	askForClusters();
});

