/**
 * SST-OSINT - Academic Tooltips and Contextual Help
 * 
 * This script implements academic explanations of complex terms using Tippy.js
 * Used for displaying contextual help bubbles with technical explanations
 */

// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load Tippy.js from CDN if not already loaded
    if (typeof tippy === 'undefined') {
        const tippyScript = document.createElement('script');
        tippyScript.src = 'https://unpkg.com/@popperjs/core@2';
        document.head.appendChild(tippyScript);
        
        const tippyScript2 = document.createElement('script');
        tippyScript2.src = 'https://unpkg.com/tippy.js@6';
        tippyScript2.onload = function() {
            initializeAcademicTooltips();
        };
        document.head.appendChild(tippyScript2);
    } else {
        initializeAcademicTooltips();
    }

    // Initialize the glossary panel toggle
    setupGlossaryPanel();
});

/**
 * Initialize academic tooltips for complex terms throughout the application
 */
function initializeAcademicTooltips() {
    // Academic glossary terms with explanations
    const academicTerms = {
        'field-curvature': 'The <span class="term-highlight">Field Curvature (λ∇Ψ)</span> measures distortion in narrative space by combining entropy variance, symbolic density, and echo patterns. A high value indicates potential linguistic manipulation or cognitive distortion.',
        
        'entropy-score': 'The <span class="term-highlight">Entropy Score (Δσ)</span> quantifies narrative predictability and information density. Low entropy indicates simplified or repetitive communication patterns often found in manipulative contexts.',
        
        'fractal-recursion': 'The <span class="term-highlight">Fractal Recursion Score</span> measures self-similar patterns across different scales of communication. High values signal consistent metaphorical frameworks potentially used for conditioning.',
        
        'symbol-density': 'The <span class="term-highlight">Symbol Density (Φ)</span> quantifies the concentration of symbolic or metaphorical language in a text. Higher density correlates with persuasion techniques that leverage archetypal or emotional symbolism.',
        
        'echo-intensity': 'The <span class="term-highlight">Echo Intensity (εᵥ)</span> measures repetition of key phrases in varying contexts. High values may indicate reinforcement conditioning or attempts to normalize problematic concepts.',

        'field-classification': 'The <span class="term-highlight">Field Classification</span> categorizes the text based on its overall distortion pattern, from BASELINE (normal) to SEVERE (highly concerning). Classifications help prioritize investigation resources.',
        
        'observer-simulation': 'The <span class="term-highlight">Observer Simulation Layer (OSL)</span> models how different observers might interpret the same text. This helps identify content specifically targeted at vulnerable populations.',
        
        'symbolic-drift': 'The <span class="term-highlight">Symbolic Drift</span> describes how meanings shift or evolve through metaphoric chains. In manipulative contexts, this creates conceptual bridges between normal and harmful ideas.',
        
        'shadow-constant': 'The <span class="term-highlight">Shadow Constant (SC)</span> is a theoretical value representing the minimum amount of linguistic distortion required to shift perception. It\'s derived from the Field Curvature equation.',
        
        'entropy-collapse': 'An <span class="term-highlight">Entropy Collapse</span> occurs when narrative complexity suddenly reduces, often indicating a critical point where coercive influence becomes most effective.',
        
        'narrative-recursion': 'The <span class="term-highlight">Narrative Recursion</span> pattern identifies self-reinforcing stories that create closed belief systems resistant to outside information.',
        
        'field-tension': 'The <span class="term-highlight">Field Tension</span> measures incongruities between linguistic elements in a text. High values often indicate deception or attempts to reconcile contradictory narratives.',
        
        'semantic-density': 'The <span class="term-highlight">Semantic Density</span> evaluates the ratio of meaningful content to communication volume. Low density with high word count often signals obfuscation techniques.',
        
        'metaphoric-chain': 'A <span class="term-highlight">Metaphoric Chain</span> connects concepts through shared symbolic relationships, creating bridges between unrelated ideas. These chains can normalize harmful concepts incrementally.'
    };

    // Find all elements with the academic-term class and apply tooltips
    document.querySelectorAll('.academic-term').forEach(el => {
        const termId = el.getAttribute('data-term');
        if (termId && academicTerms[termId]) {
            tippy(el, {
                content: academicTerms[termId],
                allowHTML: true,
                theme: 'academic',
                placement: 'top',
                maxWidth: 350,
                interactive: true,
                appendTo: document.body
            });
        }
    });
    
    // Add tooltips to visualization elements
    document.querySelectorAll('.chart-explanation').forEach(el => {
        const explanationText = el.getAttribute('data-explanation');
        if (explanationText) {
            tippy(el, {
                content: explanationText,
                allowHTML: true,
                theme: 'academic',
                placement: 'left',
                maxWidth: 350
            });
        }
    });
}

/**
 * Add tooltips programmatically to elements
 * 
 * Usage: 
 * addAcademicTooltip('field-curvature', document.getElementById('my-element'));
 */
function addAcademicTooltip(termKey, element) {
    if (!element) return;
    
    // Make the element look like a tooltip term
    element.classList.add('academic-term');
    element.setAttribute('data-term', termKey);
    
    // Re-initialize tooltips
    initializeAcademicTooltips();
}

/**
 * Setup the glossary panel for all academic terms
 */
function setupGlossaryPanel() {
    // Create glossary toggle button if it doesn't exist
    if (!document.querySelector('.glossary-toggle')) {
        const toggleBtn = document.createElement('div');
        toggleBtn.className = 'glossary-toggle';
        toggleBtn.innerHTML = '<i class="bi bi-book"></i> Academic Glossary';
        document.body.appendChild(toggleBtn);
        
        // Create glossary panel
        const glossaryPanel = document.createElement('div');
        glossaryPanel.className = 'glossary-panel';
        glossaryPanel.innerHTML = `
            <div class="glossary-close"><i class="bi bi-x-lg"></i></div>
            <div class="glossary-title">Shadow Systems Theory - Academic Glossary</div>
            <div class="glossary-items">
                <!-- Items will be added dynamically -->
            </div>
        `;
        document.body.appendChild(glossaryPanel);
        
        // Toggle functionality
        toggleBtn.addEventListener('click', function() {
            glossaryPanel.classList.toggle('visible');
        });
        
        // Close button
        glossaryPanel.querySelector('.glossary-close').addEventListener('click', function() {
            glossaryPanel.classList.remove('visible');
        });
        
        // Populate glossary items
        populateGlossaryItems();
    }
}

/**
 * Populate the glossary panel with academic terms
 */
function populateGlossaryItems() {
    const glossaryItems = document.querySelector('.glossary-items');
    if (!glossaryItems) return;
    
    // Get all tooltips that have been initialized
    const academicTerms = {
        'field-curvature': {
            term: 'Field Curvature (λ∇Ψ)',
            definition: 'Measures distortion in narrative space by combining entropy variance, symbolic density, and echo patterns. A high value indicates potential linguistic manipulation or cognitive distortion.'
        },
        'entropy-score': {
            term: 'Entropy Score (Δσ)',
            definition: 'Quantifies narrative predictability and information density. Low entropy indicates simplified or repetitive communication patterns often found in manipulative contexts.'
        },
        'fractal-recursion': {
            term: 'Fractal Recursion Score',
            definition: 'Measures self-similar patterns across different scales of communication. High values signal consistent metaphorical frameworks potentially used for conditioning.'
        },
        'symbol-density': {
            term: 'Symbol Density (Φ)',
            definition: 'Quantifies the concentration of symbolic or metaphorical language in a text. Higher density correlates with persuasion techniques that leverage archetypal or emotional symbolism.'
        },
        'echo-intensity': {
            term: 'Echo Intensity (εᵥ)',
            definition: 'Measures repetition of key phrases in varying contexts. High values may indicate reinforcement conditioning or attempts to normalize problematic concepts.'
        },
        'field-classification': {
            term: 'Field Classification',
            definition: 'Categorizes the text based on its overall distortion pattern, from BASELINE (normal) to SEVERE (highly concerning). Classifications help prioritize investigation resources.'
        },
        'observer-simulation': {
            term: 'Observer Simulation Layer (OSL)',
            definition: 'Models how different observers might interpret the same text. This helps identify content specifically targeted at vulnerable populations.'
        },
        'symbolic-drift': {
            term: 'Symbolic Drift',
            definition: 'Describes how meanings shift or evolve through metaphoric chains. In manipulative contexts, this creates conceptual bridges between normal and harmful ideas.'
        },
        'shadow-constant': {
            term: 'Shadow Constant (SC)',
            definition: 'A theoretical value representing the minimum amount of linguistic distortion required to shift perception. It\'s derived from the Field Curvature equation.'
        },
        'entropy-collapse': {
            term: 'Entropy Collapse',
            definition: 'Occurs when narrative complexity suddenly reduces, often indicating a critical point where coercive influence becomes most effective.'
        },
        'narrative-recursion': {
            term: 'Narrative Recursion',
            definition: 'Pattern identifies self-reinforcing stories that create closed belief systems resistant to outside information.'
        },
        'field-tension': {
            term: 'Field Tension',
            definition: 'Measures incongruities between linguistic elements in a text. High values often indicate deception or attempts to reconcile contradictory narratives.'
        },
        'semantic-density': {
            term: 'Semantic Density',
            definition: 'Evaluates the ratio of meaningful content to communication volume. Low density with high word count often signals obfuscation techniques.'
        },
        'metaphoric-chain': {
            term: 'Metaphoric Chain',
            definition: 'Connects concepts through shared symbolic relationships, creating bridges between unrelated ideas. These chains can normalize harmful concepts incrementally.'
        }
    };
    
    // Create items
    let itemsHTML = '';
    Object.keys(academicTerms).forEach(key => {
        const term = academicTerms[key];
        itemsHTML += `
            <div class="glossary-item">
                <div class="glossary-term">${term.term}</div>
                <div class="glossary-definition">${term.definition}</div>
            </div>
        `;
    });
    
    glossaryItems.innerHTML = itemsHTML;
}
