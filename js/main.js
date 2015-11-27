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

var scale0 = (w - 1) / 2 / Math.PI,
    zoom = d3.behavior.zoom()
      .on("zoom", zoomed);

//Define map projection
var projection = d3.geo.mercator()
.center([-77.2, 38.4])
.translate([ w / 2, h / 2 ])
.scale([w * 11.5]);
//var projection = d3.geo.mercator()
//.translate([0, 0])
//.scale(1);

//Define path generator
var path = d3.geo.path()
.projection(projection);

//Create SVG
var svg = d3.select("#map")
.append("svg")
.attr("id", "map-svg")
.attr("width", w)
.attr("height", h);

svg.call(zoom);

var colors = d3.scale.category10();

d3.csv("HB980-vote-2014.csv", function (data) {

  d3.json("md-house-boundary.json", function (json) {
    // Compute right scale and translation
    //var b = path.bounds(json),
    //  s = .9 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h),
    //  t = [(w - s * (b[1][0] + b[0][0])) / 2, (h/20 - s * b[0][1])];
    //projection.scale(s)
    //  .translate(t);
    zoom.translate(projection.translate())
      .scale(projection.scale())
      .scaleExtent([projection.scale(), 4 * projection.scale()]);
    d3.select(".leaflet-control-zoom-out").style("opacity", 0.3);

    //Bind data and create one path per GeoJSON feature
    svg.selectAll("path")
      .data(json.geometries)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#bbb");

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

    });
  });
});

function zoomed() {
  projection.translate(zoom.translate())
      .scale(zoom.scale());

  svg.selectAll("path")
      .attr("d", path);
  svg.selectAll("circle")
      .attr("cx", function (d) {
        return projection([d.longitude, d.latitude])[0];
      })
      .attr("cy", function (d) {
        return projection([d.longitude, d.latitude])[1];
      });

  if(zoom.scale() >= zoom.scaleExtent()[1]) {
      d3.select(".leaflet-control-zoom-in").style("opacity", 0.3);
  } else {
      d3.select(".leaflet-control-zoom-in").style("opacity", 0.75);
  }
  if(zoom.scale()-1 <= zoom.scaleExtent()[0]) {
      d3.select(".leaflet-control-zoom-out").style("opacity", 0.3);
  } else {
      d3.select(".leaflet-control-zoom-out").style("opacity", 0.75);
  }
}

function mkZoomEvent(shift) {
  var center = projection([ -76.1, 39.5]);
  var el = document.getElementById("map"),
      bbox = el.getBoundingClientRect();
  var evt = document.createEvent("MouseEvents");
  evt.initMouseEvent(
    'dblclick', // in DOMString typeArg,
     true,  // in boolean canBubbleArg,
     true,  // in boolean cancelableArg,
     window,// in views::AbstractView viewArg,
     120,   // in long detailArg,
     bbox.left + center[0],     // in long screenXArg,
     bbox.top + center[1],     // in long screenYArg,
     bbox.left + center[0],     // in long clientXArg,
     bbox.top + center[1],     // in long clientYArg,
     0,     // in boolean ctrlKeyArg,
     0,     // in boolean altKeyArg,
     shift ? 1 : 0,     // in boolean shiftKeyArg,
     0,     // in boolean metaKeyArg,
     0,     // in unsigned short buttonArg,
     null   // in EventTarget relatedTargetArg
  );
  document.getElementById("map-svg").dispatchEvent(evt);
}

function zoomIn() {
  mkZoomEvent(false);
}

function zoomOut() {
  mkZoomEvent(true);
}
