// Data & Utility Functions
const margin = { top: 40, right: 20, bottom: 40, left: 50 };
const tooltip = d3.select("body").append("div").attr("class", "tooltip");
const parseDate = d3.timeParse("%Y-%m-%d");

// Main Drawing Function
function drawCharts() {
    // Load data from the JSON file created by Python
    Promise.all([
        d3.json("data.json"),
        d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")
    ]).then(function([allData, us]) {
        const salesData = allData.salesData;
        const asinData = allData.asinData;
        const buyerData = allData.buyerData;

        // Draw the sales chart
        drawSalesChart(salesData);

        // Draw the ASIN performance bar chart
        drawAsinChart(asinData);

        // Draw the map chart
        drawMapChart(us, buyerData);
    });
}

// Function to draw the sales chart
function drawSalesChart(data) {
    const container = d3.select("#salesChart");
    const containerWidth = container.node().getBoundingClientRect().width;
    const containerHeight = 400; // Set a fixed height
    const svgWidth = containerWidth;
    const svgHeight = containerHeight;

    container.html("");

    data.forEach(d => d.date = parseDate(d.date));

    // Use viewBox for responsiveness
    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calculate chart area dimensions within margins
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const x = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.sales)]).nice().range([height, 0]);

    const line = d3.line().x(d => x(d.date)).y(d => y(d.sales));

    svg.append("path").datum(data).attr("class", "line").attr("d", line);
    svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(d3.timeDay.every(5))).attr("class", "axis")
    svg.append("g").call(d3.axisLeft(y)).attr("class", "axis")

    // Add title to the chart
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "#06472D")
        .text("Daily Sales Trend");

    // Add Tooltip
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.sales))
        .attr("r", 4)
        .style("fill", "#2ecc71")
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1).html(`Date: ${d.date.toDateString()}<br/>Sales: $${d.sales}`);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));
}

// Function to draw the ASIN bar chart
function drawAsinChart(data) {
    const container = d3.select("#asinChart");
    const containerWidth = container.node().getBoundingClientRect().width;
    const containerHeight = 400; // Set a fixed height
    const svgWidth = containerWidth;
    const svgHeight = containerHeight;

    container.html("");

    data.sort((a, b) => b.revenue - a.revenue);

    // Use viewBox for responsiveness
    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Calculate chart area dimensions within margins
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const x = d3.scaleBand().domain(data.map(d => d.asin)).range([0, width]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.revenue)]).nice().range([height, 0]);

    svg.selectAll(".bar").data(data).enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.asin))
        .attr("y", d => y(d.revenue))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.revenue))
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1).html(`ASIN: ${d.asin}<br/>Revenue: $${d.revenue}<br/>Rating: ${d.rating}`);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .attr("class", "axis")
        .selectAll("text") // Select all text elements
        .style("text-anchor", "start") // Set text alignment
        .attr("dx", "-.8em") // Adjust horizontal position
        .attr("dy", ".15em") // Adjust vertical position
        .attr("transform", "rotate(10)"); // Rotate text

    svg.append("g").call(d3.axisLeft(y)).attr("class", "axis");

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "#0B407A")
        .text("ASIN Performance");
}

// Function for drawing the responsive map chart
function drawMapChart(us, buyerData) {
    const container = d3.select("#buyerMapChart");
    const containerWidth = container.node().getBoundingClientRect().width;
    const containerHeight = 450; // Set a fixed height

    // Clear previous chart
    container.html("");

    // Create a responsive SVG element with viewBox
    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Create a data map using state names as keys
    const dataByState = {};
    buyerData.forEach(d => dataByState[d.state] = d.orders);

    // Define the color scale
    const maxOrders = d3.max(buyerData, d => d.orders);
    const colorScale = d3.scaleLinear()
        .domain([0, maxOrders])
        .range(["#f0f8ff", "#1f4068"]); // Color gradient from light to dark

    // Create the projection and path for the map
    const projection = d3.geoAlbersUsa()
        .fitSize([containerWidth, containerHeight], topojson.feature(us, us.objects.states));
    const path = d3.geoPath().projection(projection);

    // Add the tooltip element
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .style("fill", d => {
            // Retrieve orders from buyerData using d.properties.name as the key
            const orders = dataByState[d.properties.name];
            return orders ? colorScale(orders) : "#ccc"; // Color based on orders
        })
        .style("stroke", "#fff")
        .style("stroke-width", "1px")
        .on("mouseover", function(event, d) {
            d3.select(this).style("fill", "#FFD700"); // Change color on hover
            const orders = dataByState[d.properties.name] || 0;
            tooltip.style("opacity", 1)
                .html(`<strong>${d.properties.name}</strong><br/>Orders: ${orders}`);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).style("fill", d => {
                const orders = dataByState[d.properties.name];
                return orders ? colorScale(orders) : "#ccc"; // Revert to original color
            });
            tooltip.style("opacity", 0);
        });

    svg.append("text")
        .attr("x", containerWidth / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "#06472D")
        .text("Orders by State");
}

// Event listeners to redraw charts on load and resize
const debouncedDrawCharts = debounce(drawCharts, 250);
window.addEventListener('load', debouncedDrawCharts);
window.addEventListener('resize', debouncedDrawCharts);

// Debounce function to prevent excessive redraws on resize
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}