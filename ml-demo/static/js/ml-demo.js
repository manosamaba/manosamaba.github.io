// --- Global variables and setup ---
const margin = { top: 20, right: 20, bottom: 30, left: 40 };

let width, height;
let linearModel, logisticModel;
let linearData = [], logisticData = [];
let xScale_linear, yScale_linear, xScale_logistic, yScale_logistic;

const loadingScreen = document.getElementById('loading-screen');

function showLoading() {
    loadingScreen.style.display = 'flex';
}

function hideLoading() {
    loadingScreen.style.display = 'none';
}

// --- D3.js Helper Functions for Plotting ---
function createSVG(plotAreaSelection) {
    const container = plotAreaSelection.node().parentNode;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    width = containerWidth - margin.left - margin.right;
    height = containerHeight - margin.top - margin.bottom;

    const svg = plotAreaSelection
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .html("")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    return svg;
}

function drawAxes(svg, xScale, yScale) {
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));
}

// --- Linear Regression ---
async function runLinearRegression() {
    showLoading();
    const plotArea = d3.select("#plotArea_linear");
    const svg = createSVG(plotArea);

    const initialDataPoints = [
        { x: 1, y: 5 }, { x: 4, y: 8 }, { x: 5, y: 10 }, { x: 6, y: 15 },
        { x: 9, y: 19 }
    ];

    linearModel = tf.sequential();
    linearModel.add(tf.layers.dense({ units: 1, inputShape: [1] }));
    linearModel.compile({
        loss: 'meanSquaredError',
        optimizer: tf.train.sgd(0.01)
    });

    xScale_linear = d3.scaleLinear().domain([0, 10]).range([0, width]);
    yScale_linear = d3.scaleLinear().domain([0, 20]).range([height, 0]);

    linearData = initialDataPoints.map(d => ({
        x: xScale_linear(d.x),
        y: yScale_linear(d.y)
    }));

    await addLinearPointAndRetrain(svg);
    hideLoading();
}

async function addLinearPointAndRetrain(svg) {
    const allX = linearData.map(d => xScale_linear.invert(d.x));
    const allY = linearData.map(d => yScale_linear.invert(d.y));

    const xs = tf.tensor2d(allX.map(d => [d]));
    const ys = tf.tensor2d(allY.map(d => [d]));

    await linearModel.fit(xs, ys, { epochs: 100 });
    drawLinearPlot(svg);
}

async function drawLinearPlot(svg) {
    svg.selectAll("*").remove();

    const regressionX_data = [0, 10];
    const predictionTensor = linearModel.predict(tf.tensor2d(regressionX_data, [2, 1]));
    const regressionY_data = (await predictionTensor.array()).flat();
    
    const lineData_screen = [
        {x: xScale_linear(regressionX_data[0]), y: yScale_linear(regressionY_data[0])},
        {x: xScale_linear(regressionX_data[1]), y: yScale_linear(regressionY_data[1])}
    ];
    
    const lineGenerator = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    svg.append("path")
        .datum(lineData_screen)
        .attr("class", "regression-line")
        .attr("id", "regressionLinePath")
        .attr("d", lineGenerator);
    
    svg.append("text")
        .attr("class", "line-label")
        .append("textPath")
        .attr("href", "#regressionLinePath")
        .attr("startOffset", "50%")
        .text("Regression Line");

    const dots = svg.selectAll(".dot")
        .data(linearData)
        .join("circle")
        .attr("class", "dot")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 10);

    svg.selectAll(".drag-text")
        .data(linearData)
        .join("text")
        .attr("class", "drag-text")
        .attr("x", d => d.x)
        .attr("y", d => d.y + 15)
        .text("drag me");

    const drag = d3.drag()
        .on("drag", function(event, d) {
            d.x = event.x;
            d.y = event.y;
            d3.select(this)
                .attr("cx", d.x)
                .attr("cy", d.y);
            
            d3.select(this.parentNode).select(".drag-text")
                .attr("x", d.x)
                .attr("y", d.y + 15);
        })
        .on("end", async () => {
            showLoading();
            await addLinearPointAndRetrain(svg);
            hideLoading();
        });

    dots.call(drag);
}

// --- Logistic Regression ---
async function runLogisticRegression() {
    showLoading();
    const plotArea = d3.select("#plotArea_logistic");
    const svg = createSVG(plotArea);

    if (!logisticModel) {
        logisticModel = tf.sequential();
        logisticModel.add(tf.layers.dense({ units: 1, activation: 'sigmoid', inputShape: [2] }));
        logisticModel.compile({
            optimizer: tf.train.adam(0.1),
            loss: 'binaryCrossentropy'
        });

        logisticData = [];
        const numPoints = 100;
        for (let i = 0; i < numPoints; i++) {
            const x = Math.random();
            const y = Math.random();
            const label = (y > x) ? 1 : 0;
            logisticData.push({ x, y, label });
        }
    }
    
    const xs = tf.tensor2d(logisticData.map(p => [p.x, p.y]));
    const ys = tf.tensor2d(logisticData.map(p => [p.label]), [logisticData.length, 1]);
    await logisticModel.fit(xs, ys, { epochs: 50 });

    drawLogisticPlot(svg);
    attachLogisticClickEvent(svg);
    hideLoading();
}

function drawLogisticPlot(svg) {
    svg.selectAll("*").remove();

    xScale_logistic = d3.scaleLinear().domain([0, 1]).range([0, width]);
    yScale_logistic = d3.scaleLinear().domain([0, 1]).range([height, 0]);

    drawAxes(svg, xScale_logistic, yScale_logistic);

    const gridPoints = 50;
    const gridData = [];
    for (let i = 0; i < gridPoints; i++) {
        for (let j = 0; j < gridPoints; j++) {
            const x = i / (gridPoints - 1);
            const y = j / (gridPoints - 1);
            gridData.push([x, y]);
        }
    }

    const predictions = logisticModel.predict(tf.tensor2d(gridData));
    const colors = predictions.arraySync().flat().map(p => p > 0.5 ? 'blue' : 'red');

    svg.selectAll(".boundary-area")
        .data(gridData)
        .join("rect")
        .attr("class", "boundary-area")
        .attr("x", (d, i) => xScale_logistic(d[0]))
        .attr("y", (d, i) => yScale_logistic(d[1]))
        .attr("width", xScale_logistic(1/gridPoints) - xScale_logistic(0))
        .attr("height", yScale_logistic(0) - yScale_logistic(1/gridPoints))
        .attr("fill", (d, i) => colors[i]);

    svg.selectAll(".logistic-dot")
        .data(logisticData)
        .join("circle")
        .attr("class", "logistic-dot")
        .attr("cx", d => xScale_logistic(d.x))
        .attr("cy", d => yScale_logistic(d.y))
        .attr("r", 5)
        .attr("fill", d => d.label === 1 ? "blue" : "red");
}

function attachLogisticClickEvent(svg) {
    svg.on("click", async (event) => {
        showLoading();
        const coords = d3.pointer(event);
        const newX = xScale_logistic.invert(coords[0]);
        const newY = yScale_logistic.invert(coords[1]);

        logisticData.push({ x: newX, y: newY, label: -1 });

        const xs = tf.tensor2d(logisticData.map(p => [p.x, p.y]));
        const ys = tf.tensor2d(logisticData.map(p => [p.label]), [logisticData.length, 1]);
        await logisticModel.fit(xs, ys, { epochs: 50 });

        const prediction = await logisticModel.predict(tf.tensor2d([[newX, newY]])).array();
        const predictedClass = prediction[0][0] > 0.5 ? 1 : 0;
        
        logisticData[logisticData.length - 1].label = predictedClass;

        drawLogisticPlot(svg);
        hideLoading();
    });
}

// --- Main Functionality and Event Listeners ---
function showSection(modelName) {
    document.querySelectorAll('.model-section').forEach(section => {
        section.classList.remove('active');
        if (section.id === `${modelName}-section`) {
            section.classList.add('active');
        }
    });

    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.model === modelName) {
            btn.classList.add('active');
        }
    });
    
    if (modelName === 'linear') {
        runLinearRegression();
    } else if (modelName === 'logistic') {
        runLogisticRegression();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', (event) => {
            showSection(event.target.dataset.model);
        });
    });

    window.addEventListener('resize', () => {
        const currentModel = document.querySelector('.tab-button.active').dataset.model;
        if (currentModel === 'linear' && linearModel) {
            runLinearRegression();
        } else if (currentModel === 'logistic' && logisticModel) {
            runLogisticRegression();
        }
    });

    showSection('linear');
});