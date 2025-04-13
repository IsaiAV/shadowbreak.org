/**
 * Export Tools for SST-OSINT Analysis Results
 * Provides functionality to export analysis results in various formats
 */

class ExportTools {
    constructor() {
        // Default export options
        this.defaultOptions = {
            includeFullText: false,
            includeCharts: true,
            formatNumbers: true,
            precision: 4,
            dateFormat: 'YYYY-MM-DD HH:mm'
        };
    }
    
    // Initialize export buttons
    initExportButtons() {
        // Find all export buttons on the page
        document.querySelectorAll('.export-btn').forEach(button => {
            const format = button.getAttribute('data-export-format');
            const targetId = button.getAttribute('data-export-target');
            
            if (format && targetId) {
                button.addEventListener('click', () => {
                    const target = document.getElementById(targetId);
                    if (target) {
                        // Get custom options from button attributes
                        const options = {
                            ...this.defaultOptions,
                            includeFullText: button.getAttribute('data-include-text') === 'true',
                            includeCharts: button.getAttribute('data-include-charts') !== 'false',
                            precision: parseInt(button.getAttribute('data-precision') || 4),
                            title: button.getAttribute('data-title') || 'SST-OSINT Analysis'
                        };
                        
                        // Export based on format
                        switch (format.toLowerCase()) {
                            case 'pdf':
                                this.exportToPDF(target, options);
                                break;
                            case 'csv':
                                this.exportToCSV(target, options);
                                break;
                            case 'json':
                                this.exportToJSON(target, options);
                                break;
                            case 'image':
                                this.exportToImage(target, options);
                                break;
                            case 'print':
                                this.printReport(target, options);
                                break;
                            default:
                                console.error('Unsupported export format:', format);
                        }
                    } else {
                        console.error('Export target not found:', targetId);
                    }
                });
            }
        });
    }
    
    // Format a date using the specified format
    formatDate(date, format) {
        const d = new Date(date);
        
        // Simple replacements for common date formats
        return format
            .replace('YYYY', d.getFullYear())
            .replace('MM', String(d.getMonth() + 1).padStart(2, '0'))
            .replace('DD', String(d.getDate()).padStart(2, '0'))
            .replace('HH', String(d.getHours()).padStart(2, '0'))
            .replace('mm', String(d.getMinutes()).padStart(2, '0'))
            .replace('ss', String(d.getSeconds()).padStart(2, '0'));
    }
    
    // Collect analysis data from DOM
    collectAnalysisData(container, options) {
        const data = {
            title: options.title || 'SST-OSINT Analysis',
            date: this.formatDate(new Date(), options.dateFormat),
            field_classification: '',
            field_curvature: 0,
            segments: [],
            metrics: {},
            interpretation: []
        };
        
        // Extract field classification
        const classification = container.querySelector('h2:contains("Field Classification")');
        if (classification) {
            data.field_classification = classification.textContent.replace('Field Classification:', '').trim();
        }
        
        // Extract field metrics from table
        const metricsTable = container.querySelector('table');
        if (metricsTable) {
            const rows = metricsTable.querySelectorAll('tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('th, td');
                if (cells.length >= 2) {
                    const name = cells[0].textContent.trim();
                    let value = cells[1].textContent.trim();
                    
                    // Convert numeric values
                    if (!isNaN(parseFloat(value))) {
                        value = parseFloat(value);
                    }
                    
                    // Extract field curvature
                    if (name.includes('Field Curvature') || name.includes('λ∇Ψ')) {
                        data.field_curvature = value;
                    }
                    
                    data.metrics[name] = value;
                }
            });
        }
        
        // Extract interpretation bullets
        const interpretationLists = container.querySelectorAll('.card-body ul');
        interpretationLists.forEach(list => {
            const items = list.querySelectorAll('li');
            items.forEach(item => {
                data.interpretation.push(item.textContent.trim());
            });
        });
        
        // Extract segment data
        const segmentPoints = container.querySelectorAll('.segment-point');
        segmentPoints.forEach((point, index) => {
            const segmentData = {
                index: index,
                field_curvature: parseFloat(point.getAttribute('aria-label').match(/Field curvature ([\d.]+)/)[1])
            };
            
            data.segments.push(segmentData);
        });
        
        // Include full text if requested and available
        if (options.includeFullText) {
            data.fullText = container.querySelector('#analyzed-text')?.textContent.trim() || '';
        }
        
        return data;
    }
    
    // Export to PDF format
    exportToPDF(container, options) {
        // Dynamically import html2pdf
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        document.head.appendChild(script);
        
        script.onload = () => {
            // Clone the container to avoid modifying the original
            const content = container.cloneNode(true);
            
            // Optional: Enhance styling for PDF
            content.querySelectorAll('.card').forEach(card => {
                card.style.marginBottom = '15px';
                card.style.pageBreakInside = 'avoid';
            });
            
            // Apply watermark and styling
            const watermark = document.createElement('div');
            watermark.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1000; 
                            display: flex; justify-content: center; align-items: center; opacity: 0.07;">
                    <div style="transform: rotate(-45deg); font-size: 60px; font-weight: bold;">
                        SST-OSINT
                    </div>
                </div>
            `;
            content.appendChild(watermark);
            
            // Add header with title and date
            const header = document.createElement('div');
            header.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="margin-bottom: 5px;">${options.title}</h1>
                    <p>Generated on: ${this.formatDate(new Date(), options.dateFormat)}</p>
                </div>
            `;
            content.insertBefore(header, content.firstChild);
            
            // PDF options
            const pdfOptions = {
                margin: [10, 10, 10, 10],
                filename: `${options.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            
            // Generate PDF
            html2pdf().from(content).set(pdfOptions).save();
        };
    }
    
    // Export to CSV format
    exportToCSV(container, options) {
        const data = this.collectAnalysisData(container, options);
        
        // Create CSV rows
        let csvContent = 'Field,Value\n';
        
        // Add metadata
        csvContent += `Title,"${data.title}"\n`;
        csvContent += `Date,"${data.date}"\n`;
        csvContent += `Field Classification,"${data.field_classification}"\n`;
        csvContent += `Field Curvature (λ∇Ψ),${options.formatNumbers ? data.field_curvature.toFixed(options.precision) : data.field_curvature}\n`;
        
        // Add metrics
        csvContent += '\nMetrics\n';
        for (const [name, value] of Object.entries(data.metrics)) {
            const formattedValue = typeof value === 'number' && options.formatNumbers 
                ? value.toFixed(options.precision) 
                : value;
            csvContent += `"${name}","${formattedValue}"\n`;
        }
        
        // Add interpretation
        csvContent += '\nInterpretation\n';
        data.interpretation.forEach((item, i) => {
            csvContent += `Observation ${i+1},"${item}"\n`;
        });
        
        // Add segments
        if (data.segments.length > 0) {
            csvContent += '\nSegments\n';
            csvContent += 'Segment,Field Curvature\n';
            data.segments.forEach(segment => {
                csvContent += `${segment.index + 1},${options.formatNumbers ? segment.field_curvature.toFixed(options.precision) : segment.field_curvature}\n`;
            });
        }
        
        // Add fullText if included
        if (options.includeFullText && data.fullText) {
            csvContent += '\nAnalyzed Text\n';
            csvContent += `"${data.fullText.replace(/"/g, '""')}"\n`;
        }
        
        // Create and download a CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Export to JSON format
    exportToJSON(container, options) {
        const data = this.collectAnalysisData(container, options);
        
        // Format numbers if requested
        if (options.formatNumbers) {
            this._formatNumbersRecursively(data, options.precision);
        }
        
        // Create and download a JSON file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Helper function to format numbers recursively
    _formatNumbersRecursively(obj, precision) {
        for (const key in obj) {
            if (typeof obj[key] === 'number') {
                obj[key] = parseFloat(obj[key].toFixed(precision));
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                this._formatNumbersRecursively(obj[key], precision);
            }
        }
    }
    
    // Export to Image format (PNG)
    exportToImage(container, options) {
        // Dynamically import html2canvas
        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        document.head.appendChild(script);
        
        script.onload = () => {
            // Add a temporary class to improve rendering
            container.classList.add('exporting-image');
            
            // Image options
            const imageOptions = {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#1a1a1a'
            };
            
            // Generate image
            html2canvas(container, imageOptions).then(canvas => {
                // Remove temporary class
                container.classList.remove('exporting-image');
                
                // Create and download the image
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `${options.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }).catch(error => {
                console.error('Error generating image:', error);
                container.classList.remove('exporting-image');
            });
        };
    }
    
    // Print the report
    printReport(container, options) {
        // Clone the container to avoid modifying the original
        const content = container.cloneNode(true);
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        
        if (printWindow) {
            // Add styles and content
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${options.title} - Print</title>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.5;
                            padding: 20px;
                            color: #000;
                            background-color: #fff;
                        }
                        
                        .card {
                            border: 1px solid #ccc;
                            border-radius: 5px;
                            margin-bottom: 20px;
                            page-break-inside: avoid;
                            background-color: #f9f9f9;
                        }
                        
                        .card-header {
                            background-color: #eee;
                            padding: 10px 15px;
                            border-bottom: 1px solid #ccc;
                        }
                        
                        .card-body {
                            padding: 15px;
                        }
                        
                        h1, h2, h3, h4, h5, h6 {
                            margin-top: 0;
                        }
                        
                        table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        
                        table, th, td {
                            border: 1px solid #ccc;
                        }
                        
                        th, td {
                            padding: 8px;
                            text-align: left;
                        }
                        
                        th {
                            background-color: #eee;
                        }
                        
                        @media print {
                            .no-print {
                                display: none;
                            }
                            
                            body {
                                padding: 0;
                            }
                            
                            a {
                                text-decoration: none;
                                color: #000;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-header">
                        <h1>${options.title}</h1>
                        <p>Generated on: ${this.formatDate(new Date(), options.dateFormat)}</p>
                    </div>
                    <div id="print-content"></div>
                    <div class="no-print" style="margin-top: 20px; text-align: center;">
                        <button onclick="window.print();">Print</button>
                        <button onclick="window.close();">Close</button>
                    </div>
                </body>
                </html>
            `);
            
            // Fix styles for printing (convert dark theme to light)
            content.querySelectorAll('.bg-dark, .navbar-dark, [class*="bg-"]').forEach(el => {
                el.classList.remove('bg-dark', 'navbar-dark');
                el.classList.add('bg-light');
            });
            
            content.querySelectorAll('.text-white').forEach(el => {
                el.classList.remove('text-white');
                el.classList.add('text-dark');
            });
            
            // Remove unnecessary elements for printing
            content.querySelectorAll('button, .btn, nav, .export-section').forEach(el => {
                el.classList.add('no-print');
            });
            
            // Append content to the print window
            printWindow.document.getElementById('print-content').appendChild(content);
            
            // Auto-print when loaded (optional)
            // printWindow.onload = function() {
            //     printWindow.print();
            // };
        } else {
            console.error('Could not open print window. Please check pop-up blocker settings.');
        }
    }
}

// Initialize export tools when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const exportTools = new ExportTools();
    exportTools.initExportButtons();
    
    // Add export buttons to results page if not already present
    const resultsContainer = document.querySelector('.analysis-results');
    if (resultsContainer && !document.querySelector('.export-section')) {
        const exportSection = document.createElement('div');
        exportSection.className = 'export-section text-center mb-4';
        exportSection.innerHTML = `
            <h4 class="mb-3">Export Results</h4>
            <div class="btn-group" role="group" aria-label="Export options">
                <button type="button" class="btn btn-outline-info export-btn" data-export-format="pdf" data-export-target="analysis-results" title="Export as PDF">
                    <i class="bi bi-file-earmark-pdf"></i> PDF
                </button>
                <button type="button" class="btn btn-outline-info export-btn" data-export-format="csv" data-export-target="analysis-results" title="Export as CSV">
                    <i class="bi bi-file-earmark-spreadsheet"></i> CSV
                </button>
                <button type="button" class="btn btn-outline-info export-btn" data-export-format="json" data-export-target="analysis-results" title="Export as JSON">
                    <i class="bi bi-file-earmark-code"></i> JSON
                </button>
                <button type="button" class="btn btn-outline-info export-btn" data-export-format="image" data-export-target="analysis-results" title="Export as Image">
                    <i class="bi bi-file-earmark-image"></i> Image
                </button>
                <button type="button" class="btn btn-outline-info export-btn" data-export-format="print" data-export-target="analysis-results" title="Print Report">
                    <i class="bi bi-printer"></i> Print
                </button>
            </div>
        `;
        
        // Insert after the main results and before the "New Analysis" button
        const newAnalysisBtn = resultsContainer.querySelector('.text-center.mb-5');
        if (newAnalysisBtn) {
            resultsContainer.insertBefore(exportSection, newAnalysisBtn);
        } else {
            resultsContainer.appendChild(exportSection);
        }
    }
});

// Add CSS for export functionality
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .export-section {
            margin: 20px 0;
            padding: 15px;
            border-top: 1px solid #444;
            border-bottom: 1px solid #444;
        }
        
        .export-btn {
            margin: 0 5px;
        }
        
        .export-btn i {
            margin-right: 5px;
        }
        
        .exporting-image {
            background-color: #1a1a1a !important;
            padding: 20px !important;
            border-radius: 8px !important;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5) !important;
        }
        
        @media (max-width: 768px) {
            .export-section .btn-group {
                flex-wrap: wrap;
            }
            
            .export-section .btn {
                margin-bottom: 5px;
                flex: 1 0 auto;
            }
        }
    `;
    document.head.appendChild(style);
})();
