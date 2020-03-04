var slider_single = document.getElementById("myRange");
var output = document.getElementById("slider_demo");
output.innerHTML = slider_single.value;

slider_single.oninput = function() {
  output.innerHTML = this.value;
}
