// Load the JSON data from the JSON_Data folder
const jsonPath = './JSON_Data/train.json';
d3.json(jsonPath).then(data => {
  // Extract the "GrLivArea" and "SalePrice" data
  const livingAreas = data.map(d => d.GrLivArea);
  const salePrices = data.map(d => d.SalePrice);

  // Set up the SVG dimensions and margins
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Create the SVG element
  const svg = d3.select('#scatterplot-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Create the scale for the X-axis (Living Area)
  const xScale = d3.scaleLinear()
    .domain([0, 6000]) // Extend X-axis to 6000
    .range([0, width]);

  // Create the scale for the Y-axis (Sale Price)
  const yScale = d3.scaleLinear()
    .domain([0, 1000000]) // Raise Y-axis to 1M
    .range([height, 0]);

  // Create the X-axis
  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.format(",.0f"))); // Format X-axis ticks

  // Create the Y-axis
  svg.append('g')
    .call(d3.axisLeft(yScale).tickFormat(d3.format("$.2s"))); // Format Y-axis ticks

  // Create the scatter plot points
  svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.GrLivArea))
    .attr('cy', d => yScale(d.SalePrice))
    .attr('r', 5)
    .attr('fill', 'steelblue')
    .on('mouseover', (event, d) => {
      // Show the tooltip on hover
      tooltip.transition()
        .duration(200)
        .style('opacity', 0.9);
      tooltip.html(`Price: $${d.SalePrice}<br>SQ Footage: ${d.GrLivArea} sqft`)
        .style('left', `${xScale(d.GrLivArea) + margin.left}px`) // Position the tooltip relative to the scatterplot container
        .style('top', `${yScale(d.SalePrice) + margin.top}px`);
    })
    .on('mouseout', () => {
      // Hide the tooltip on mouseout
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    });

  // Add axis labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Living Area (SQ Feet)"); // Change X-axis title to SQ Feet

  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("class", "axis-label")
    .text("Sale Price"); // Change Y-axis title to Sale Price

  // Create the tooltip element
  const tooltip = d3.select('.tooltip')
    .style('opacity', 0);
});