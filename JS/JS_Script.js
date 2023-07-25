// Load the JSON data from the JSON_Data folder
const jsonPath = './JSON_Data/train.json';
d3.json(jsonPath).then(data => {
  // Filter out any invalid or missing data points in SalePrice field
  const filteredData = data.filter(d => d.SalePrice !== null && !isNaN(d.SalePrice));

  // Extract the "Overall Quality" and "Sale Price" data
  const overallQualities = filteredData.map(d => d.OverallQual);
  const salePrices = filteredData.map(d => d.SalePrice);

  // Set up the SVG dimensions and margins
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Create the SVG element
  const svg = d3.select('#boxplot-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Create the scale for the X-axis (Overall Quality)
  const xScale = d3.scaleBand()
    .domain(d3.range(1, 11))
    .range([0, width])
    .paddingInner(0.2)
    .paddingOuter(0.2);

  // Create the scale for the Y-axis (Sale Price)
  const yScale = d3.scaleLinear()
    .domain([0, 1000000]) // Set the Y-axis domain to [0, 1000000]
    .range([height, 0]);

  // Create the X-axis
  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  // Create the Y-axis
  svg.append('g')
    .call(d3.axisLeft(yScale).tickFormat(d3.format(".2s")));

  // Create the Y-axis label
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -margin.left + 20)
    .style('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('Sale Price');

  // Create the X-axis label
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 10)
    .style('text-anchor', 'middle')
    .style('font-size', '14px')
    .text('Quality Score');

  // Create the boxes and whiskers for each Overall Quality level
  d3.range(1, 11).forEach(quality => {
    const values = salePrices.filter((d, i) => overallQualities[i] === quality);
    const quartiles = [d3.quantile(values, 0.25), d3.quantile(values, 0.5), d3.quantile(values, 0.75)]; // Calculate quartiles directly
    const median = d3.median(values);
    const iqr = quartiles[2] - quartiles[0];
    const outliers = values.filter(d => d < quartiles[0] - 1.5 * iqr || d > quartiles[2] + 1.5 * iqr);

    // Check the quartile values (optional)
    console.log("Quality:", quality, "Quartiles:", quartiles[0], quartiles[2], "Median:", median);

    // Create the box
    svg.append('rect')
      .attr('x', xScale(quality) + xScale.bandwidth() / 4)
      .attr('y', yScale(quartiles[2]))
      .attr('width', xScale.bandwidth() / 2)
      .attr('height', yScale(quartiles[0]) - yScale(quartiles[2]))
      .attr('fill', 'steelblue');

    // Create the median line
    svg.append('line')
      .attr('x1', xScale(quality) + xScale.bandwidth() / 4)
      .attr('x2', xScale(quality) + 3 * xScale.bandwidth() / 4)
      .attr('y1', yScale(median))
      .attr('y2', yScale(median))
      .attr('stroke', 'black')
      .attr('stroke-width', 2);

    // Create the upper whisker
    svg.append('line')
      .attr('x1', xScale(quality) + xScale.bandwidth() / 2)
      .attr('x2', xScale(quality) + xScale.bandwidth() / 2)
      .attr('y1', yScale(quartiles[2] + 1.5 * iqr))
      .attr('y2', yScale(d3.max(values)))
      .attr('stroke', 'black')
      .attr('stroke-width', 2);

    // Create the lower whisker
    svg.append('line')
      .attr('x1', xScale(quality) + xScale.bandwidth() / 2)
      .attr('x2', xScale(quality) + xScale.bandwidth() / 2)
      .attr('y1', yScale(quartiles[0] - 1.5 * iqr))
      .attr('y2', yScale(d3.min(values)))
      .attr('stroke', 'black')
      .attr('stroke-width', 2);
  });
});