/**
 * Shadow Systems Theory - Technical Glossary Tooltips
 * Provides explanations for complex technical terms
 */

document.addEventListener('DOMContentLoaded', function() {
    // Import Tippy.js from CDN if not available
    if (typeof tippy === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@popperjs/core@2';
        document.head.appendChild(script);
        
        const tippyScript = document.createElement('script');
        tippyScript.src = 'https://unpkg.com/tippy.js@6';
        document.head.appendChild(tippyScript);
        
        tippyScript.onload = initializeTooltips;
    } else {
        initializeTooltips();
    }
    
    function initializeTooltips() {
        // Enable accessibility features for tooltips
        tippy.setDefaultProps({
            trigger: 'mouseenter focus',
            interactive: true,
            appendTo: document.body,
            zIndex: 9999,
            maxWidth: 300,
            theme: 'sst-dark',
            aria: {
                content: 'describedby',
            },
            popperOptions: {
                modifiers: [{
                    name: 'preventOverflow',
                    options: {
                        altAxis: true,
                        padding: 5
                    }
                }]
            }
        });
        
        // Glossary of terms and their explanations
        const technicalTerms = {
            'field-curvature': {
                title: 'Field Curvature (λ∇Ψ)',
                content: 'A mathematical representation of narrative distortion, measuring how much a text deviates from expected linguistic patterns. Higher values indicate more manipulation or emotional loading.',
                symbol: 'λ∇Ψ'
            },
            'narrative-entropy': {
                title: 'Narrative Entropy',
                content: 'Measures the degree of semantic disorder or incoherence in a text. High entropy areas often indicate trauma zones, emotional overload, or deliberate manipulation.',
                example: 'Fragmented sentences, non-sequiturs, and contradictions can raise entropy.'
            },
            'fractal-drift': {
                title: 'Fractal Drift',
                content: 'Measures how patterns repeat at different scales throughout a text. Identifies recursive thought patterns and repeated metaphors that may indicate manipulation.',
                example: 'Similar phrases appearing in different contexts throughout a text.'
            },
            'symbolic-density': {
                title: 'Symbolic Density',
                content: 'Measures the concentration of symbolic references, metaphors, and emotionally charged language in a text. High density can indicate attempts to bypass logical processing.',
                example: 'A high concentration of religious, mythological, or cultural symbols.'
            },
            'echo-patterns': {
                title: 'Echo Patterns',
                content: 'Repeated phrases that appear in different contexts, often used in manipulation to plant ideas or reinforce messaging. Similar to "thought terminating clichés."',
                example: '"Trust the process" appearing in multiple unrelated contexts.'
            },
            'emotional-blackhole': {
                title: 'Emotional Blackhole',
                content: 'A point in narrative where symbols collapse into a highly charged emotional trigger, often used to shut down critical thinking. These are areas with extremely high symbolic density.',
                warning: 'Often used in coercive control or cult messaging.'
            },
            'recursion-score': {
                title: 'Recursion Score',
                content: 'Measures how self-referential a text is, indicating potential thought loops or circular logic that may trap the reader in repetitive patterns.',
                example: 'Repeating the same justifications or arguments in slightly different forms.'
            },
            'field-classification': {
                title: 'Field Classification',
                content: 'Overall assessment of a text based on all metrics. Categories include Stable Field (minimal distortion), Distorted Field (moderate manipulation), and Collapsed Field (severe manipulation).',
                impact: 'Helps determine potential risk level of a text.'
            },
            'shadow-system': {
                title: 'Shadow System',
                content: 'A hidden framework of ideas, symbols, and narrative structures that operates beneath the surface level of communication, often used to manipulate or control.',
                context: 'Central concept in Shadow Systems Theory.'
            },
            'observer-simulation': {
                title: 'Observer Simulation',
                content: 'Technique that models how a typical reader might process and respond to a text, predicting potential emotional and cognitive impacts.',
                application: 'Used to assess potential harm of manipulative content.'
            }
        };
        
        // Add tooltips to all technical terms with data-term attribute
        document.querySelectorAll('[data-term]').forEach(element => {
            const termId = element.getAttribute('data-term');
            const termData = technicalTerms[termId];
            
            if (termData) {
                let content = `<div class="tippy-content-wrapper">`;
                content += `<h6 class="tippy-title">${termData.title}</h6>`;
                content += `<p>${termData.content}</p>`;
                
                if (termData.example) {
                    content += `<p><small><strong>Example:</strong> ${termData.example}</small></p>`;
                }
                
                if (termData.symbol) {
                    content += `<p><small><strong>Symbol:</strong> ${termData.symbol}</small></p>`;
                }
                
                if (termData.warning) {
                    content += `<p class="text-danger"><small><strong>Warning:</strong> ${termData.warning}</small></p>`;
                }
                
                if (termData.impact) {
                    content += `<p><small><strong>Impact:</strong> ${termData.impact}</small></p>`;
                }
                
                if (termData.context) {
                    content += `<p><small><strong>Context:</strong> ${termData.context}</small></p>`;
                }
                
                if (termData.application) {
                    content += `<p><small><strong>Application:</strong> ${termData.application}</small></p>`;
                }
                
                content += `</div>`;
                
                tippy(element, {
                    content: content,
                    allowHTML: true,
                });
            }
        });
        
        // Also add tooltips to any elements with title attributes
        document.querySelectorAll('[title]:not([data-term])').forEach(element => {
            const title = element.getAttribute('title');
            if (title && title.trim() !== '') {
                tippy(element, {
                    content: title,
                });
                // Remove the title attribute to prevent double tooltips
                element.removeAttribute('title');
            }
        });
        
        // Add CSS for tooltips
        if (!document.getElementById('tippy-styles')) {
            const style = document.createElement('style');
            style.id = 'tippy-styles';
            style.textContent = `
                .tippy-box[data-theme~='sst-dark'] {
                    background-color: #1a1a1a;
                    border: 1px solid #444;
                    color: #fff;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                }
                
                .tippy-box[data-theme~='sst-dark'][data-placement^='top'] > .tippy-arrow::before {
                    border-top-color: #1a1a1a;
                }
                
                .tippy-box[data-theme~='sst-dark'][data-placement^='bottom'] > .tippy-arrow::before {
                    border-bottom-color: #1a1a1a;
                }
                
                .tippy-box[data-theme~='sst-dark'][data-placement^='left'] > .tippy-arrow::before {
                    border-left-color: #1a1a1a;
                }
                
                .tippy-box[data-theme~='sst-dark'][data-placement^='right'] > .tippy-arrow::before {
                    border-right-color: #1a1a1a;
                }
                
                .tippy-content-wrapper {
                    padding: 5px;
                }
                
                .tippy-title {
                    color: #00aaff;
                    margin-bottom: 8px;
                    border-bottom: 1px solid #333;
                    padding-bottom: 5px;
                }
                
                [data-term] {
                    cursor: help;
                    border-bottom: 1px dashed #888;
                    text-decoration: none;
                }
                
                [data-term]:hover, [data-term]:focus {
                    color: #00aaff;
                    border-bottom: 1px dashed #00aaff;
                }
            `;
            document.head.appendChild(style);
        }
    }
});
