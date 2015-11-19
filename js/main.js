//Width and height
var w = 800;
var h = 620;

var tooltip = d3.select("body")
.append("div")
.style("position", "absolute")
.style("z-index", "10")
.style("visibility", "hidden")
.style("text-shadow", "white 2px 2px")
.style("opacity", "0.87")
.style("background-color", "#F8F8F8")
.style("line-height", "1.1");

var zoom = d3.behavior.zoom()
  .translate([0, 0])
  .scale(1)
  .scaleExtent([1, 8])
  .on("zoom", zoomed);

//Define map projection
var projection = d3.geo.mercator()
.center([-77.5, 38.4])
.translate([ w / 2, h / 2 ])
.scale([w * 11.5]);
//      .rotate([77.56, 0]);

//Define path generator
var path = d3.geo.path()
.projection(projection);

//Create SVG
var svg = d3.select("#map")
.append("svg")
.attr("width", w)
.attr("height", h);


var g = svg.append("g");

var colors = d3.scale.category10();

d3.csv("HB980-vote-2014.csv", function (data) {

  //Create a circle for each city
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      //[0] returns the first coordinate (x) of the projected value
      return projection([d.longitude, d.latitude])[0];
    })
.attr("cy", function (d) {
  //[1] returns the second coordinate (y) of the projected value
  return projection([d.longitude, d.latitude])[1];
  })
.attr("r", 3.4)
.on("mouseover", function () {
  return tooltip.style("visibility", "visible");
  })
.on("mousemove", function (d, i) {

  var ttip = "<strong>"
  + d.full_name
  + "</strong>"
  + " ("
  + d.party.charAt(0)
  + ")<br />District "
  + d.indexmatch
  + "<br />" + d.hb0980;
  return tooltip
  .style("top", (d3.event.pageY - 10) + "px")
  .style("left", (d3.event.pageX + 10) + "px")
  .html(ttip)
  })
.on("mouseout", function () {
  return tooltip.style("visibility", "hidden");
  })
.style("fill", "yellow")
.style("opacity", 0.84)
.style("fill", function (d) {

  //Get data value
  var value = d.hb0980;

  if (value) {
  //If value exists…
  return colors(value);
  } else {
  //If value is undefined…
  return "#bcbcbc";
  }

})

});
//Load in GeoJSON data
//  d3.json("../data/countries/mapshaper_output.json", function(json) {
  d3.json("md-house-boundary.json", function (json) {
    //Bind data and create one path per GeoJSON feature
    svg.selectAll("path")
      .data(json.geometries)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#bbb")
  });

function zoomed() {
  g.style("stroke-width", 1.5 / d3.event.scale + "px");
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function zoomIn() {
  currentScale = projection.scale();
  newScale = currentScale * 2;
  path.transition()
    .duration(750)
    .attr("transform", "translate(" + w / 2 + "," + h/2 +")scale(" + newScale +")");
}