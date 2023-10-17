const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

fetch(url)
  .then((res) => res.json())
  .then((data) => {
    const baseTemp = data.baseTemperature;
    const dataset = data.monthlyVariance;
    console.log(dataset);

    const width = 1100;
    const height = 600;
    const padding = 60;

    const minYear = d3.min(dataset, (d) => d.year);
    const maxYear = d3.max(dataset, (d) => d.year);
    
    var colors = [
      "#313695",
      "#4575b4",
      "#74add1",
      "#abd9e9",
      "#e0f3f8",
      "#ffffbf",
      "#fee090",
      "#fdae61",
      "#f46d43",
      "#d73027",
      "#a50026",
    ];

    d3.select("body")
      .append("h2")
      .attr("id", "description")
      .text(`${minYear} - ${maxYear}: base temperature ${baseTemp}°C`);

    const svg = d3
      .select("body")
      .append("svg")
      .attr("height", height + padding)
      .attr("width", width);
    

    
    // legend
    legendWidth = 400;
    const legendHeight = 300 / colors.length;

    const variance = dataset.map(function (val) {
      return val.variance;
    });
    const minTemp = baseTemp + Math.min.apply(null, variance);
    const maxTemp = baseTemp + Math.max.apply(null, variance);

    const legendThreshold = d3
      .scaleThreshold()
      .domain(
        (function (min, max, count) {
          const array = [];
          const step = (max - min) / count;
          const base = min;
          for (let i = 1; i < count; i++) {
            array.push(base + i * step);
          }
          return array;
        })(minTemp, maxTemp, colors.length)
      )
      .range(colors);

    const legendX = d3
      .scaleLinear()
      .domain([minTemp, maxTemp])
      .range([0, legendWidth]);

    const legendXAxis = d3
      .axisBottom()
      .scale(legendX)
      .tickSize(10, 0)
      .tickValues(legendThreshold.domain())
      .tickFormat(d3.format(".1f"));

    const legend = svg
      .append("g")
      .classed("legend", true)
      .attr("id", "legend")
      .attr("transform", "translate(" + padding + "," + height + ")");

    legend
      .append("g")
      .selectAll("rect")
      .data(
        legendThreshold.range().map(function (color) {
          var d = legendThreshold.invertExtent(color);
          if (d[0] === null) {
            d[0] = legendX.domain()[0];
          }
          if (d[1] === null) {
            d[1] = legendX.domain()[1];
          }
          return d;
        })
      )
      .enter()
      .append("rect")
      .style("fill", function (d) {
        return legendThreshold(d[0]);
      })
      .attr("x", (d) => legendX(d[0]))
      .attr("y", 0)
      .attr("width", (d) =>
        d[0] && d[1] ? legendX(d[1]) - legendX(d[0]) : legendX(null)
      )
      .attr("height", legendHeight);

    legend
      .append("g")
      .attr("transform", "translate(" + 0 + "," + legendHeight + ")")
      .call(legendXAxis);



    // scale
    const xScale = d3
      .scaleLinear()
      .domain([minYear, maxYear + 1])
      .range([padding, width - padding]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

    svg
      .append("g")
      .call(xAxis)
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - padding})`);

    const yScale = d3
      .scaleTime()
      .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
      .range([padding, height - padding]);

    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"))

    svg
      .append("g")
      .call(yAxis)
      .attr("id", "y-axis")
      .attr("transform", `translate(${padding}, 0)`);

    svg
      .selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d) => xScale(d.year))
      .attr("y", (d) => yScale(new Date(0, d.month - 1, 0, 0, 0, 0, 0)))
      .attr("fill", function (d) {
        return legendThreshold(baseTemp + d.variance);
      })
      .attr("data-month", (d) => d.month - 1)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => baseTemp + d.variance)
      .attr("height", (height - 2 * padding) / 12)
      .attr("width", (d) => {
        const years = maxYear - minYear;
        return (width - 2 * padding) / years;
      })

      .on("mousemove", function (e, d) {
        const tooltip = d3.select("#tooltip");
        const date = new Date(d.year, d.month);

        tooltip
          .style("opacity", 0.9)
          .style("left", e.pageX + 10 + "px")
          .style("top", e.pageY + 10 + "px")
          .style("font-size", "14ppx");

        tooltip
          .attr("data-year", d.year)
          .html(`${d3.utcFormat('%Y - %B')(date)} <br/> ${d3.format(".1f")(d.variance + baseTemp)}&#8451;<br/> ${d.variance}&#8451;`);
      })
      .on("mouseout", function (e) {
        d3.select("#tooltip").style("opacity", 0);
      });

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", "0")
      .style("position", "absolute")
      .style("background-color", "rgba(0,0,0,0.9")
      .style("color", "#fff")
      .style("padding", "10px")
      .style("border-radius", "5px");

  });
