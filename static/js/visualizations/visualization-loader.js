/**
 * Visualization Loader for SST-OSINT Analysis
 * Handles dynamic loading and initialization of visualizations
 */

class VisualizationLoader {
    constructor(options = {}) {
        this.options = Object.assign({
            defaultHeight: 400,
            defaultWidth: '100%',
            loadingMessage: 'Loading visualization...',
            errorMessage: 'Failed to load visualization.',
            darkMode: true,
            animate: true,
            responsive: true
        }, options);
        
        this.visualizationTypes = {
            'narrative-drift': {
                name: 'Narrative Drift',
                description: 'Shows changes in entropy, symbolic density, echo patterns and fractal recursion across text segments',
                create: this.createNarrativeDriftViz.bind(this)
            },
            'entropy-heatmap': {
                name: 'Entropy Heatmap',
                description: 'Shows semantic entropy distribution as a heatmap',
                create: this.createEntropyHeatmapViz.bind(this)
            },
            'echo-network': {
                name: 'Echo Network',
                description: 'Visualizes connections between repeated phrases (echo patterns)',
                create: this.createEchoNetworkViz.bind(this)
            },
            'symbol-cloud': {
                name: 'Symbol Cloud',
                description: 'Generates a word cloud of symbolic references and loaded terms',
                create: this.createSymbolCloudViz.bind(this)
            },
            'entropy-score': {
                name: 'Narrative Entropy Analysis',
                description: 'Analyzes narrative entropy patterns across text segments to identify distortion',
                create: this.createNarrativeDriftViz.bind(this)
            }
        };
        
        // Track loaded visualizations
        this.loadedVisualizations = [];
    }
    
    // Load all visualizations defined in the DOM
    loadAll() {
        // Find all visualization containers
        const containers = document.querySelectorAll('[data-visualization]');
        
        containers.forEach(container => {
            const vizType = container.getAttribute('data-visualization');
            const dataUrl = container.getAttribute('data-url');
            const dataId = container.getAttribute('data-id');
            
            if (vizType && this.visualizationTypes[vizType]) {
                // Load data if URL is provided
                if (dataUrl) {
                    this.loadDataFromUrl(dataUrl)
                        .then(data => {
                            this.createVisualization(container, vizType, data);
                        })
                        .catch(error => {
                            console.error(`Error loading data from ${dataUrl}:`, error);
                            this.showError(container, this.options.errorMessage);
                        });
                } 
                // Load data from embedded element if ID is provided
                else if (dataId) {
                    const dataElement = document.getElementById(dataId);
                    if (dataElement && dataElement.textContent) {
                        try {
                            const data = JSON.parse(dataElement.textContent);
                            this.createVisualization(container, vizType, data);
                        } catch (error) {
                            console.error(`Error parsing data from element #${dataId}:`, error);
                            this.showError(container, this.options.errorMessage);
                        }
                    } else {
                        console.error(`Data element #${dataId} not found or empty`);
                        this.showError(container, this.options.errorMessage);
                    }
                } else {
                    console.error('No data source specified for visualization');
                    this.showError(container, 'No data source specified.');
                }
            } else {
                console.error(`Unknown visualization type: ${vizType}`);
                this.showError(container, `Unknown visualization type: ${vizType}`);
            }
        });
    }
    
    // Load data from URL
    loadDataFromUrl(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            });
    }
    
    // Create visualization based on type
    createVisualization(container, type, data) {
        // Get container options
        const options = this.getContainerOptions(container);
        
        // Clear container and show loading message
        container.innerHTML = '';
        this.showLoading(container);
        
        // Create visualization based on type
        const vizType = this.visualizationTypes[type];
        if (vizType && typeof vizType.create === 'function') {
            // Create visualization with delay to allow loading message to show
            setTimeout(() => {
                const viz = vizType.create(container, data, options);
                if (viz) {
                    this.loadedVisualizations.push(viz);
                }
            }, 100);
        } else {
            this.showError(container, `Visualization type '${type}' not supported.`);
        }
    }
    
    // Extract options from container attributes
    getContainerOptions(container) {
        return {
            height: parseInt(container.getAttribute('data-height') || this.options.defaultHeight),
            width: container.getAttribute('data-width') || this.options.defaultWidth,
            animated: container.getAttribute('data-animated') !== 'false' && this.options.animate,
            responsive: container.getAttribute('data-responsive') !== 'false' && this.options.responsive,
            darkMode: container.getAttribute('data-dark-mode') !== 'false' && this.options.darkMode,
            title: container.getAttribute('data-title') || '',
            description: container.getAttribute('data-description') || '',
            showLegend: container.getAttribute('data-legend') !== 'false',
            showControls: container.getAttribute('data-controls') !== 'false',
            colorScheme: container.getAttribute('data-colors') || null
        };
    }
    
    // Show loading message
    showLoading(container) {
        const loader = document.createElement('div');
        loader.className = 'viz-loader';
        loader.innerHTML = `
            <div class="viz-loader-spinner"></div>
            <div class="viz-loader-text">${this.options.loadingMessage}</div>
        `;
        container.appendChild(loader);
    }
    
    // Show error message
    showError(container, message) {
        container.innerHTML = '';
        const errorElement = document.createElement('div');
        errorElement.className = 'viz-error';
        errorElement.innerHTML = `
            <div class="viz-error-icon">⚠️</div>
            <div class="viz-error-message">${message}</div>
        `;
        container.appendChild(errorElement);
    }
    
    // Create a Narrative Drift visualization
    createNarrativeDriftViz(container, data, options) {
        // Clear container
        container.innerHTML = '';
        
        // If NarrativeDriftVisualizer is available, use it
        if (typeof NarrativeDriftVisualizer === 'function') {
            const visualizer = new NarrativeDriftVisualizer(`#${container.id}`, {
                height: options.height,
                animated: options.animated,
                responsive: options.responsive,
                useCategoricalColors: options.useCategoricalColors,
                colorScheme: options.colorScheme
            });
            
            visualizer.update(data);
            return visualizer;
        } else {
            // Fallback to D3.js if NarrativeDriftVisualizer is not available
            this.createD3NarrativeDrift(container, data, options);
        }
    }
    
    // D3.js fallback implementation for Narrative Drift
    createD3NarrativeDrift(container, data, options) {
        // Dynamically load D3.js if not available
        if (typeof d3 === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://d3js.org/d3.v7.min.js';
            document.head.appendChild(script);
            
            script.onload = () => {
                this._renderD3NarrativeDrift(container, data, options);
            };
        } else {
            this._renderD3NarrativeDrift(container, data, options);
        }
    }
    
    // Render the D3.js version of Narrative Drift visualization
    _renderD3NarrativeDrift(container, data, options) {
        // Extract segments data
        const segments = data.segments || [];
        if (segments.length === 0) {
            this.showError(container, 'No segment data available.');
            return;
        }
        
        // Setup dimensions
        const margin = { top: 40, right: 60, bottom: 60, left: 60 };
        const width = container.clientWidth - margin.left - margin.right;
        const height = options.height - margin.top - margin.bottom;
        
        // Create SVG
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
            
        // Create scales
        const x = d3.scaleLinear()
            .domain([0, segments.length - 1])
            .range([0, width]);
            
        // Find min and max values for y scale
        const metrics = ['entropy', 'symbolic_density', 'echo_intensity', 'fractal_recursion'];
        let minY = Infinity;
        let maxY = -Infinity;
        
        segments.forEach(segment => {
            metrics.forEach(metric => {
                if (segment[metric] < minY) minY = segment[metric];
                if (segment[metric] > maxY) maxY = segment[metric];
            });
        });
        
        minY = minY * 0.9; // Add some padding
        maxY = maxY * 1.1;
        
        const y = d3.scaleLinear()
            .domain([minY, maxY])
            .range([height, 0]);
            
        // Create axes
        const xAxis = d3.axisBottom(x)
            .ticks(Math.min(segments.length, 10))
            .tickFormat(d => `Segment ${d + 1}`);
            
        const yAxis = d3.axisLeft(y)
            .ticks(5);
            
        // Add axes to SVG
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .selectAll('text')
            .attr('dy', '1em')
            .attr('transform', 'rotate(-15)')
            .style('text-anchor', 'middle');
            
        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis);
            
        // Add axis labels
        svg.append('text')
            .attr('class', 'x label')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', height + 50)
            .text('Text Segments');
            
        svg.append('text')
            .attr('class', 'y label')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -40)
            .text('Distortion Metrics');
            
        // Create line generators for each metric
        const metricColors = {
            'entropy': '#ff6b6b',
            'symbolic_density': '#5eead4',
            'echo_intensity': '#ffd166',
            'fractal_recursion': '#9381ff'
        };
        
        metrics.forEach(metric => {
            const line = d3.line()
                .x((d, i) => x(i))
                .y(d => y(d[metric]))
                .curve(d3.curveMonotoneX);
                
            const path = svg.append('path')
                .datum(segments)
                .attr('fill', 'none')
                .attr('stroke', metricColors[metric])
                .attr('stroke-width', 2)
                .attr('d', line);
                
            if (options.animated) {
                const totalLength = path.node().getTotalLength();
                
                path.attr('stroke-dasharray', totalLength + ' ' + totalLength)
                    .attr('stroke-dashoffset', totalLength)
                    .transition()
                    .duration(1000)
                    .ease(d3.easeLinear)
                    .attr('stroke-dashoffset', 0);
            }
        });
        
        // Add legend
        const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${width - 120}, 0)`);
            
        metrics.forEach((metric, i) => {
            const metricName = metric
                .replace('_', ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
                
            legend.append('rect')
                .attr('x', 0)
                .attr('y', i * 20)
                .attr('width', 15)
                .attr('height', 2)
                .attr('fill', metricColors[metric]);
                
            legend.append('text')
                .attr('x', 20)
                .attr('y', i * 20 + 5)
                .text(metricName)
                .style('font-size', '12px')
                .attr('alignment-baseline', 'middle');
        });
    }
    
    // Create an Entropy Heatmap visualization
    createEntropyHeatmapViz(container, data, options) {
        // Clear container
        container.innerHTML = '';
        
        // Placeholder for entropy heatmap - This will be implemented with D3.js
        const placeholder = document.createElement('div');
        placeholder.className = 'entropy-heatmap-placeholder';
        placeholder.textContent = 'Entropy Heatmap visualization will be implemented soon.';
        container.appendChild(placeholder);
    }
    
    // Create an Echo Network visualization
    createEchoNetworkViz(container, data, options) {
        // Clear container
        container.innerHTML = '';
        
        // Placeholder for echo network - This will be implemented with D3.js
        const placeholder = document.createElement('div');
        placeholder.className = 'echo-network-placeholder';
        placeholder.textContent = 'Echo Network visualization will be implemented soon.';
        container.appendChild(placeholder);
    }
    
    // Create a Symbol Cloud visualization
    createSymbolCloudViz(container, data, options) {
        // Clear container
        container.innerHTML = '';
        
        // Placeholder for symbol cloud - This will be implemented with D3.js
        const placeholder = document.createElement('div');
        placeholder.className = 'symbol-cloud-placeholder';
        placeholder.textContent = 'Symbol Cloud visualization will be implemented soon.';
        container.appendChild(placeholder);
    }
}

// Initialize visualization loader when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const loader = new VisualizationLoader();
    loader.loadAll();
    
    // Make loader available globally for dynamic loading
    window.vizLoader = loader;
});

// Add CSS for visualization components
(function() {
    const style = document.createElement('style');
    style.textContent = `
        [data-visualization] {
            position: relative;
            min-height: 200px;
            margin: 20px 0;
            background-color: rgba(20, 20, 20, 0.5);
            border-radius: 4px;
            padding: 10px;
            overflow: hidden;
        }
        
        .echo-network-container,
        .symbol-cloud-container {
            overflow: hidden;
            max-height: 500px; /* Match the data-height attribute */
            height: 100%;
            width: 100%;
        }
        
        .viz-loader {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: rgba(0, 0, 0, 0.1);
        }
        
        .viz-loader-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(0, 170, 255, 0.2);
            border-radius: 50%;
            border-top-color: #00aaff;
            animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .viz-loader-text {
            margin-top: 10px;
            color: #aaa;
        }
        
        .viz-error {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: rgba(0, 0, 0, 0.1);
            color: #ff6b6b;
        }
        
        .viz-error-icon {
            font-size: 32px;
            margin-bottom: 10px;
        }
        
        .viz-error-message {
            font-size: 14px;
            max-width: 80%;
            text-align: center;
        }
        
        .legend-title {
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .legend-items {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            margin-right: 15px;
        }
        
        .legend-color {
            display: inline-block;
            width: 16px;
            height: 16px;
            margin-right: 5px;
            border-radius: 2px;
        }
        
        .legend-label {
            font-size: 12px;
            color: #ddd;
        }
        
        @media (max-width: 768px) {
            .legend-items {
                flex-direction: column;
                gap: 8px;
            }
            
            .legend-item {
                margin-right: 0;
            }
        }
        
        /* Placeholder styles */
        .entropy-heatmap-placeholder,
        .echo-network-placeholder,
        .symbol-cloud-placeholder {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
            background-color: rgba(30, 30, 30, 0.5);
            border-radius: 4px;
            color: #aaa;
            font-style: italic;
        }
    `;
    document.head.appendChild(style);
})();
