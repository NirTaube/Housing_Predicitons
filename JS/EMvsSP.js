// Load the JSON data from the JSON_Data folder
const jsonPath = './JSON_Data/train.json';
d3.json(jsonPath).then(data => {
  // Group homes into bins based on their square footage
  const bins = [0, 1000, 2000, 3500, Infinity]; // Bins for sq footage
  const binLabels = ['0-999', '1000-1999', '2000-3499', '3500+']; // Labels for legend
  const colors = ['#e2708b', '#68b7a8', '#6e85c7', '#ffaf69']; // Darker colors for legend

  const exteriorMaterials = Array.from(new Set(data.map(d => d.Exterior1st)));

  const groupedData = exteriorMaterials.map(material => {
    const materialHomes = data.filter(d => d.Exterior1st === material);
    const sqFtGroups = d3.group(materialHomes, d => {
      const sqFt = d.GrLivArea;
      return bins.findIndex(bin => sqFt < bin); // Find appropriate bin index
    });

    const medianSalePrices = Array.from(sqFtGroups, ([bin, homes]) => {
      const prices = homes.map(d => d.SalePrice).sort(d3.ascending);
      const medianIndex = Math.floor(prices.length / 2);
      return {
        bin: binLabels[bin],
        medianPrice: prices.length % 2 === 0 ? (prices[medianIndex - 1] + prices[medianIndex]) / 2 : prices[medianIndex],
      };
    });

    return { material, medianSalePrices };
  });

  // Create the bar chart
  const svgWidth = 800;
  const svgHeight = 400;
  const margin = { top: 40, right: 100, bottom: 80, left: 80 }; // Increased margins for axis labels
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const svg = d3.select('body')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

  const chart = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);


  // Add y-axis label
  chart.append('text')
  .attr('x', -(chartHeight / 2))
  .attr('y', -margin.left + 20)
  .attr('transform', 'rotate(-90)')
  .attr('text-anchor', 'middle')
  .style('font-size', '14px')
  .text('Sale Price');

// Add x-axis label
chart.append('text')
  .attr('x', chartWidth / 2)
  .attr('y', chartHeight + margin.bottom - 10)
  .attr('text-anchor', 'middle')
  .style('font-size', '14px')
  .text('Exterior Material');


  const x0Scale = d3.scaleBand()
    .domain(exteriorMaterials)
    .range([0, chartWidth])
    .paddingInner(0.1)
    .paddingOuter(0.2);

  const x1Scale = d3.scaleBand()
    .domain(binLabels)
    .range([0, x0Scale.bandwidth()])
    .padding(0.05);

  const yScale = d3.scaleLinear()
    .domain([0, 850000]) // Extend the y-axis range to 850,000
    .range([chartHeight, 0]);

  const xAxis = d3.axisBottom(x0Scale);
  const yAxis = d3.axisLeft(yScale);

  chart.append('g')
    .attr('transform', `translate(0,${chartHeight})`)
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-0.8em')
    .attr('dy', '-0.15em')
    .attr('transform', 'rotate(-65)'); // Adjust rotation angle and positioning

  chart.append('g')
    .call(yAxis);

  const groups = chart.selectAll('.group')
    .data(groupedData)
    .enter()
    .append('g')
    .attr('class', 'group')
    .attr('transform', d => `translate(${x0Scale(d.material)},0)`);

  groups.selectAll('rect')
  .data(d => d.medianSalePrices)
  .enter()
  .append('rect')
  .attr('x', d => x1Scale(d.bin))
  .attr('y', d => yScale(d.medianPrice))
  .attr('width', x1Scale.bandwidth())
  .attr('height', d => chartHeight - yScale(d.medianPrice))
  .attr('fill', (d, i) => colors[i])
  .on('mouseover', function (event, d) {
    // Get the bar's position relative to the page
    const rectPosition = this.getBoundingClientRect();

    // Show tooltip with median price when hovered over
    const tooltip = chart.append('g')
      .attr('class', 'tooltip');

    tooltip.append('rect')
      .attr('x', rectPosition.x + x1Scale.bandwidth() / 2 - 60) // Adjust the x-position to center the tooltip
      .attr('y', rectPosition.y - 45) // Adjust the y-position to center the tooltip
      .attr('width', 120) // Increase the width to accommodate the text
      .attr('height', 30) // Increase the height to accommodate the text
      .attr('fill', 'rgba(0, 0, 0, 0.7)')
      .attr('rx', 10) // Add rounded corners
      .attr('ry', 10); // Add rounded corners

    tooltip.append('text')
      .attr('x', rectPosition.x + x1Scale.bandwidth() / 2)
      .attr('y', rectPosition.y - 30) // Adjust the y-position to center the text
      .attr('fill', '#fff')
      .attr('text-anchor', 'middle')
      .style('font-size', '10px') // Set the font size to 14px
      .text(`Median Price: $${d3.format(',')(d.medianPrice)}`);
  })
  .on('mouseout', function () {
    // Remove tooltip when not hovered over
    d3.select('.tooltip').remove();
  });

  // Add a legend for the bins
  const legend = chart.append('g')
    .attr('transform', `translate(${chartWidth - 20}, ${margin.top})`);

  const legendItems = legend.selectAll('.legend-item')
    .data(binLabels)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * 20})`);

  legendItems.append('rect')
    .attr('width', 15)
    .attr('height', 15)
    .attr('fill', (d, i) => colors[i]);

  legendItems.append('text')
    .attr('x', 20)
    .attr('y', 12)
    .text(d => d);
});