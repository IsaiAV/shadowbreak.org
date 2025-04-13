/**
 * Dynamic Color-Coded Visualization of Narrative Drift Patterns
 * Uses D3.js to create interactive visualizations of text analysis results
 */

class NarrativeDriftVisualizer {
    constructor(containerSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            console.error('Container not found:', containerSelector);
            return;
        }
        
        this.options = Object.assign({
            width: this.container.clientWidth || 800,
            height: 400,
            margin: { top: 40, right: 30, bottom: 50, left: 60 },
            animated: true,
            animationDuration: 800,
            colorScheme: 'interpolateViridis',
            colorRange: ['#0000ff', '#00ff00', '#ff0000'], // Blue (stable) to Green (neutral) to Red (distorted)
            useCategoricalColors: false,
            tooltips: true,
            accessibility: true,
            responsive: true
        }, options);
        
        this.data = null;
        this.svg = null;
        this.tooltip = null;
        this.initialized = false;
        this.colorScale = null;
        this.xScale = null;
        this.yScale = null;
        
        // Initialize visualization container
        this._init();
        
        // Handle responsive resizing
        if (this.options.responsive) {
            window.addEventListener('resize', this._handleResize.bind(this));
        }
    }
    
    // Initialize the visualization container
    _init() {
        this.container.innerHTML = '';
        this.container.classList.add('narrative-drift-visualization');
        
        // Create SVG element
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.options.width)
            .attr('height', this.options.height)
            .attr('aria-label', 'Narrative Drift Visualization')
            .attr('role', 'img')
            .attr('tabindex', '0')
            .style('overflow', 'visible');
        
        // Add description for screen readers
        if (this.options.accessibility) {
            this.svg.append('desc')
                .text('A visualization showing narrative drift patterns over text segments, ' +
                      'where colors represent different levels of distortion or manipulation.');
            
            this.svg.append('title')
                .text('Narrative Drift Pattern Visualization');
        }
        
        // Create a group for the visualization elements
        this.vizGroup = this.svg.append('g')
            .attr('transform', `translate(${this.options.margin.left}, ${this.options.margin.top})`);
            
        // Create tooltip if enabled
        if (this.options.tooltips) {
            this.tooltip = d3.select(this.container)
                .append('div')
                .attr('class', 'drift-tooltip')
                .style('position', 'absolute')
                .style('visibility', 'hidden')
                .style('background-color', '#1a1a1a')
                .style('color', '#fff')
                .style('padding', '8px')
                .style('border-radius', '4px')
                .style('border', '1px solid #444')
                .style('box-shadow', '0 2px 10px rgba(0, 0, 0, 0.5)')
                .style('pointer-events', 'none')
                .style('z-index', '1000')
                .style('max-width', '250px')
                .style('font-size', '14px');
        }
        
        // Add loading message
        this.vizGroup.append('text')
            .attr('x', (this.options.width - this.options.margin.left - this.options.margin.right) / 2)
            .attr('y', (this.options.height - this.options.margin.top - this.options.margin.bottom) / 2)
            .attr('text-anchor', 'middle')
            .attr('class', 'loading-text')
            .style('fill', '#aaa')
            .text('Loading visualization...');
            
        this.initialized = true;
    }
    
    // Handle resizing
    _handleResize() {
        if (!this.initialized || !this.data) return;
        
        const newWidth = this.container.clientWidth;
        
        // Update width
        this.options.width = newWidth;
        
        // Update SVG size
        this.svg
            .attr('width', this.options.width)
            .attr('height', this.options.height);
            
        // Redraw the visualization
        this.update(this.data);
    }
    
    // Set up scales based on data
    _setupScales() {
        if (!this.data) return;
        
        const width = this.options.width - this.options.margin.left - this.options.margin.right;
        const height = this.options.height - this.options.margin.top - this.options.margin.bottom;
        
        // X scale - segments
        this.xScale = d3.scaleLinear()
            .domain([0, this.data.segments.length - 1])
            .range([0, width]);
            
        // Y scale - metrics
        const allMetrics = this.data.segments.flatMap(segment => [
            segment.entropy,
            segment.symbolic_density,
            segment.echo_intensity,
            segment.fractal_recursion
        ]);
        
        const yMin = d3.min(allMetrics) * 0.9;
        const yMax = d3.max(allMetrics) * 1.1;
        
        this.yScale = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([height, 0]);
            
        // Color scale for distortion level
        if (this.options.useCategoricalColors) {
            // Categorical colors for field classifications
            this.colorScale = d3.scaleOrdinal()
                .domain(['Stable Field', 'Distorted Field', 'Collapsed Field'])
                .range(['#4682b4', '#f0ad4e', '#d9534f']);
        } else {
            // Continuous color scale for field curvature
            const curvatureValues = this.data.segments.map(segment => segment.entropy_score);
            const curvatureMin = d3.min(curvatureValues);
            const curvatureMax = d3.max(curvatureValues);
            
            this.colorScale = d3.scaleLinear()
                .domain([curvatureMin, (curvatureMin + curvatureMax) / 2, curvatureMax])
                .range(this.options.colorRange)
                .interpolate(d3.interpolateRgb);
        }
    }
    
    // Create the axis elements
    _setupAxes() {
        if (!this.xScale || !this.yScale) return;
        
        const height = this.options.height - this.options.margin.top - this.options.margin.bottom;
        
        // Remove any existing axes
        this.vizGroup.selectAll('.axis').remove();
        
        // Create X axis
        const xAxis = d3.axisBottom(this.xScale)
            .ticks(Math.min(this.data.segments.length, 10))
            .tickFormat(d => `Segment ${d + 1}`);
            
        this.vizGroup.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis)
            .selectAll('text')
            .attr('dy', '1em')
            .attr('transform', 'rotate(-15)')
            .style('text-anchor', 'middle');
            
        // Add X axis label
        this.vizGroup.append('text')
            .attr('class', 'axis-label x-label')
            .attr('x', (this.options.width - this.options.margin.left - this.options.margin.right) / 2)
            .attr('y', height + 40)
            .attr('text-anchor', 'middle')
            .style('fill', '#fff')
            .text('Text Segments');
            
        // Create Y axis
        const yAxis = d3.axisLeft(this.yScale)
            .ticks(5);
            
        this.vizGroup.append('g')
            .attr('class', 'axis y-axis')
            .call(yAxis);
            
        // Add Y axis label
        this.vizGroup.append('text')
            .attr('class', 'axis-label y-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -40)
            .attr('text-anchor', 'middle')
            .style('fill', '#fff')
            .text('Distortion Metrics');
            
        // Add color legend
        this._createLegend();
    }
    
    // Create a color legend
    _createLegend() {
        const legendGroup = this.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${this.options.width - this.options.margin.right - 120}, ${this.options.margin.top})`);
            
        if (this.options.useCategoricalColors) {
            // Categorical legend
            const categories = ['Stable Field', 'Distorted Field', 'Collapsed Field'];
            
            legendGroup.selectAll('.legend-item')
                .data(categories)
                .enter()
                .append('g')
                .attr('class', 'legend-item')
                .attr('transform', (d, i) => `translate(0, ${i * 20})`)
                .each(function(d) {
                    const g = d3.select(this);
                    
                    // Add color box
                    g.append('rect')
                        .attr('width', 12)
                        .attr('height', 12)
                        .attr('fill', d => this.colorScale(d));
                        
                    // Add text label
                    g.append('text')
                        .attr('x', 20)
                        .attr('y', 10)
                        .attr('fill', '#fff')
                        .style('font-size', '12px')
                        .text(d);
                }.bind(this));
        } else {
            // Continuous color gradient legend
            const legendWidth = 120;
            const legendHeight = 15;
            
            // Create gradient
            const defs = this.svg.append('defs');
            
            const gradient = defs.append('linearGradient')
                .attr('id', 'legend-gradient')
                .attr('x1', '0%')
                .attr('x2', '100%')
                .attr('y1', '0%')
                .attr('y2', '0%');
                
            // Add color stops
            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', this.options.colorRange[0]);
                
            gradient.append('stop')
                .attr('offset', '50%')
                .attr('stop-color', this.options.colorRange[1]);
                
            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', this.options.colorRange[2]);
                
            // Create gradient rectangle
            legendGroup.append('rect')
                .attr('width', legendWidth)
                .attr('height', legendHeight)
                .attr('fill', 'url(#legend-gradient)');
                
            // Add legend labels
            legendGroup.append('text')
                .attr('x', 0)
                .attr('y', legendHeight + 15)
                .attr('text-anchor', 'start')
                .style('fill', '#fff')
                .style('font-size', '12px')
                .text('Stable');
                
            legendGroup.append('text')
                .attr('x', legendWidth)
                .attr('y', legendHeight + 15)
                .attr('text-anchor', 'end')
                .style('fill', '#fff')
                .style('font-size', '12px')
                .text('Distorted');
                
            // Add title
            legendGroup.append('text')
                .attr('x', legendWidth / 2)
                .attr('y', -5)
                .attr('text-anchor', 'middle')
                .style('fill', '#fff')
                .style('font-size', '12px')
                .text('Narrative Entropy (λ∇Ψ)');
        }
    }
    
    // Draw multi-line chart
    _drawMultilineChart() {
        if (!this.data || !this.xScale || !this.yScale) return;
        
        // Remove loading message
        this.vizGroup.select('.loading-text').remove();
        
        // Create line generators for each metric
        const entropyLine = d3.line()
            .x((d, i) => this.xScale(i))
            .y(d => this.yScale(d.entropy))
            .curve(d3.curveMonotoneX);
            
        const densityLine = d3.line()
            .x((d, i) => this.xScale(i))
            .y(d => this.yScale(d.symbolic_density))
            .curve(d3.curveMonotoneX);
            
        const echoLine = d3.line()
            .x((d, i) => this.xScale(i))
            .y(d => this.yScale(d.echo_intensity))
            .curve(d3.curveMonotoneX);
            
        const fractalLine = d3.line()
            .x((d, i) => this.xScale(i))
            .y(d => this.yScale(d.fractal_recursion))
            .curve(d3.curveMonotoneX);
            
        // Define line paths with different colors
        const lines = [
            { path: entropyLine(this.data.segments), color: '#ff6b6b', name: 'Entropy', accessor: d => d.entropy },
            { path: densityLine(this.data.segments), color: '#5eead4', name: 'Symbol Density', accessor: d => d.symbolic_density },
            { path: echoLine(this.data.segments), color: '#ffd166', name: 'Echo Intensity', accessor: d => d.echo_intensity },
            { path: fractalLine(this.data.segments), color: '#9381ff', name: 'Fractal Recursion', accessor: d => d.fractal_recursion }
        ];
            
        // Draw each line with animation if enabled
        lines.forEach(line => {
            const path = this.vizGroup.append('path')
                .datum(this.data.segments)
                .attr('fill', 'none')
                .attr('stroke', line.color)
                .attr('stroke-width', 2)
                .attr('d', line.path)
                .attr('class', 'metric-line')
                .attr('data-metric', line.name.toLowerCase().replace(' ', '-'));
                
            if (this.options.animated) {
                const totalLength = path.node().getTotalLength();
                
                path.attr('stroke-dasharray', totalLength + ' ' + totalLength)
                    .attr('stroke-dashoffset', totalLength)
                    .transition()
                    .duration(this.options.animationDuration)
                    .ease(d3.easeLinear)
                    .attr('stroke-dashoffset', 0);
            }
        });
        
        // Create points for each segment with color based on field curvature
        this.vizGroup.selectAll('.segment-point')
            .data(this.data.segments)
            .enter()
            .append('circle')
            .attr('class', 'segment-point')
            .attr('cx', (d, i) => this.xScale(i))
            .attr('cy', (d, i) => this.yScale(d.entropy_score))
            .attr('r', 8)
            .attr('fill', d => this.colorScale(d.entropy_score))
            .attr('stroke', '#000')
            .attr('stroke-width', 1)
            .attr('opacity', 0.8)
            .attr('tabindex', 0)
            .attr('aria-label', (d, i) => `Segment ${i + 1}: Field curvature ${d.entropy_score.toFixed(2)}`);
            
        // Add tooltips for points
        if (this.options.tooltips) {
            this.vizGroup.selectAll('.segment-point')
                .on('mouseover', (event, d) => {
                    const i = this.data.segments.indexOf(d);
                    
                    this.tooltip
                        .style('visibility', 'visible')
                        .html(this._createTooltipContent(d, i));
                        
                    // Highlight the active point
                    d3.select(event.target)
                        .attr('r', 10)
                        .attr('stroke-width', 2);
                })
                .on('mousemove', (event) => {
                    this.tooltip
                        .style('top', `${event.pageY - 10}px`)
                        .style('left', `${event.pageX + 10}px`);
                })
                .on('mouseout', (event) => {
                    this.tooltip.style('visibility', 'hidden');
                    
                    // Reset point size
                    d3.select(event.target)
                        .attr('r', 8)
                        .attr('stroke-width', 1);
                })
                .on('focus', (event, d) => {
                    const i = this.data.segments.indexOf(d);
                    
                    this.tooltip
                        .style('visibility', 'visible')
                        .html(this._createTooltipContent(d, i))
                        .style('top', `${event.pageY - 10}px`)
                        .style('left', `${event.pageX + 10}px`);
                        
                    // Highlight the active point
                    d3.select(event.target)
                        .attr('r', 10)
                        .attr('stroke-width', 2);
                })
                .on('blur', (event) => {
                    this.tooltip.style('visibility', 'hidden');
                    
                    // Reset point size
                    d3.select(event.target)
                        .attr('r', 8)
                        .attr('stroke-width', 1);
                });
        }
        
        // Add line metrics legend
        const metricLegend = this.svg.append('g')
            .attr('class', 'metric-legend')
            .attr('transform', `translate(${this.options.margin.left}, ${this.options.margin.top - 15})`);
            
        lines.forEach((line, i) => {
            const legendItem = metricLegend.append('g')
                .attr('transform', `translate(${i * 150}, 0)`)
                .attr('class', 'legend-item');
                
            legendItem.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', 20)
                .attr('y2', 0)
                .attr('stroke', line.color)
                .attr('stroke-width', 2);
                
            legendItem.append('text')
                .attr('x', 25)
                .attr('y', 4)
                .attr('fill', '#fff')
                .style('font-size', '12px')
                .text(line.name);
        });
    }
    
    // Create tooltip content
    _createTooltipContent(segment, index) {
        return `
            <div class="tooltip-content">
                <div class="tooltip-header">Segment ${index + 1}</div>
                <div class="tooltip-body">
                    <div class="tooltip-row">
                        <span class="tooltip-label">Field Classification:</span>
                        <span class="tooltip-value">${segment.classification}</span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Narrative Entropy (λ∇Ψ):</span>
                        <span class="tooltip-value">${segment.entropy_score.toFixed(4)}</span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Entropy:</span>
                        <span class="tooltip-value">${segment.entropy.toFixed(4)}</span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Symbol Density:</span>
                        <span class="tooltip-value">${segment.symbolic_density.toFixed(4)}</span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Echo Intensity:</span>
                        <span class="tooltip-value">${segment.echo_intensity.toFixed(4)}</span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">Fractal Recursion:</span>
                        <span class="tooltip-value">${segment.fractal_recursion.toFixed(4)}</span>
                    </div>
                </div>
                ${segment.preview ? `
                <div class="tooltip-preview">
                    <div class="tooltip-preview-label">Text Preview:</div>
                    <div class="tooltip-preview-text">"${segment.preview}"</div>
                </div>
                ` : ''}
            </div>
        `;
    }
    
    // Update the visualization with new data
    update(data) {
        if (!this.initialized) {
            console.error('Visualization not initialized');
            return;
        }
        
        this.data = data;
        
        // Clear existing elements
        this.vizGroup.selectAll('.metric-line, .segment-point').remove();
        this.svg.selectAll('.legend, .metric-legend').remove();
        
        // Set up scales and axes
        this._setupScales();
        this._setupAxes();
        
        // Draw the visualization
        this._drawMultilineChart();
    }
    
    // Load data from URL and update visualization
    loadData(url) {
        d3.json(url)
            .then(data => {
                this.update(data);
            })
            .catch(error => {
                console.error('Error loading data:', error);
                
                // Show error message
                this.vizGroup.select('.loading-text')
                    .text('Error loading data. Please try again.');
            });
    }
}

// Initialize visualizations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check for visualization containers
    const driftContainers = document.querySelectorAll('.narrative-drift-container');
    
    driftContainers.forEach(container => {
        const dataUrl = container.getAttribute('data-url');
        const visualizer = new NarrativeDriftVisualizer(`#${container.id}`, {
            animated: container.getAttribute('data-animated') !== 'false',
            responsive: container.getAttribute('data-responsive') !== 'false',
            height: parseInt(container.getAttribute('data-height') || 400)
        });
        
        if (dataUrl) {
            visualizer.loadData(dataUrl);
        } else {
            // Check if data is embedded in a script tag
            const dataElem = document.getElementById(`${container.id}-data`);
            if (dataElem && dataElem.textContent) {
                try {
                    const data = JSON.parse(dataElem.textContent);
                    visualizer.update(data);
                } catch (e) {
                    console.error('Error parsing embedded data:', e);
                }
            }
        }
    });
});

// Add CSS for narrative drift visualization
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .narrative-drift-visualization {
            position: relative;
            width: 100%;
            overflow: visible;
        }
        
        .narrative-drift-container {
            background-color: rgba(20, 20, 20, 0.5);
            border-radius: 4px;
            padding: 10px;
            margin: 20px 0;
        }
        
        .tooltip-content {
            font-family: Arial, sans-serif;
        }
        
        .tooltip-header {
            font-weight: bold;
            border-bottom: 1px solid #444;
            margin-bottom: 5px;
            padding-bottom: 3px;
            color: #00aaff;
        }
        
        .tooltip-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
        }
        
        .tooltip-label {
            font-weight: bold;
            margin-right: 10px;
            color: #aaa;
        }
        
        .tooltip-value {
            color: #fff;
        }
        
        .tooltip-preview {
            margin-top: 8px;
            border-top: 1px solid #444;
            padding-top: 5px;
        }
        
        .tooltip-preview-label {
            font-weight: bold;
            color: #aaa;
            margin-bottom: 3px;
        }
        
        .tooltip-preview-text {
            font-style: italic;
            font-size: 0.9em;
            color: #ddd;
        }
        
        .axis {
            font-size: 12px;
        }
        
        .axis path,
        .axis line {
            stroke: #555;
        }
        
        .axis text {
            fill: #aaa;
        }
        
        @media (max-width: 768px) {
            .metric-legend {
                transform: scale(0.8);
                transform-origin: left top;
            }
        }
    `;
    document.head.appendChild(style);
})();
