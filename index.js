// Prepare width and height for the SVG container
const width = 960;
const height = 600;

// Prepare the color scale
const color = d3.scaleThreshold()
    .domain([3, 12, 21, 30, 39, 48, 57, 66])
    .range(d3.schemeGreens[9]);

// Define the projection for the map
const path = d3.geoPath();

// Create the SVG container for the map
const svg = d3.select(".container").append("svg")
    .attr("width", width)
    .attr("height", height);

Promise.all([
  d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"),
  d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json")
]).then(function(files) {
  console.log(files);
  var data1 = files[0];
  var data2 = files[1];

  // Create an id: data mapping for fast lookup
  var educationById = {};
  data1.forEach(function(d) { educationById[d.fips] = d; });

  let tooltip = d3.select('#tooltip');

  // Draw the counties and fill them with color based on education level
  svg.append("g")
  .attr("class", "counties")
  .selectAll("path")
  .data(topojson.feature(data2, data2.objects.counties).features)
  .enter().append("path")
  .attr("fill", function(d) {
    var education = educationById[d.id];
    return education ? color(education.bachelorsOrHigher) : "#ccc"; })
  .attr("d", path)
  .attr("class", "county")
  .attr("data-fips", function(d) { return d.id; }) // use d.id for fips as per the earlier data mapping
  .attr("data-education", function(d) {
    var education = educationById[d.id];
    return education ? education.bachelorsOrHigher : 0;
  })
  .on("mouseover", function(event, d) {
  var education = educationById[d.id];
    tooltip.style("opacity", 1)
      .attr("data-education", education.bachelorsOrHigher)
      .style("left", (d3.pointer(event, this)[0]) + "px")
      .style("top", (d3.pointer(event, this)[1]) + "px")
      .html(education ?
        `${education.area_name}, ${education.state}: ${education.bachelorsOrHigher}%` :
        "No data");
  })
  .on("mouseout", function(d) {
    tooltip.style("opacity", 0);
  });

      // Draw the states on top of the counties
  svg.append("path")
      .datum(topojson.mesh(data2, data2.objects.states, (a, b) => a !== b))
      .attr("class", "states")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round");

    var x = d3.scaleLinear()
        .domain([0, 60])
        .rangeRound([600, 860]);

    var g = svg.append("g")
        .attr("class", "key")
        .attr("id", "legend")
        .attr("transform", "translate(0,40)");

    g.selectAll("rect")
    .data(color.range().map(function(d) {
          d = color.invertExtent(d);
          if (d[0] == null) d[0] = x.domain()[0];
          if (d[1] == null) d[1] = x.domain()[1];
          console.log(d);
          return d;
        }))
    .enter().append("rect")
      .attr("height", 8)
      .attr("x", d => x(d[0]))
      .attr("width", d => x(d[1]) - x(d[0]))
      .attr("fill", d => color(d[0]));

    g.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Population % with Bachelor's degree or higher");

    g.call(d3.axisBottom(x)
        .tickSize(13)
        .tickFormat(function(x, i) { return i ? x + "%" : x + "%"; })
        .tickValues(color.domain()));


}).catch(function(err) {
  console.log(err);
});
