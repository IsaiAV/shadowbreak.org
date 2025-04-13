/**
 * SST-OSINT - Interactive Tutorial Walkthrough
 * 
 * This script implements an interactive tutorial for first-time users
 * to understand how to use the Shadow Systems Theory platform
 */

// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if this is the user's first visit
    const firstVisit = !localStorage.getItem('sst_tutorial_completed');
    
    // Set up the tutorial button - first check if it already exists in the HTML
    const existingButton = document.getElementById('start-tutorial');
    if (existingButton) {
        console.log("Found existing tutorial button, adding event listener");
        existingButton.addEventListener('click', function(e) {
            e.preventDefault();
            startTutorial();
        });
    } else {
        // If it doesn't exist yet, add it
        addTutorialButton();
    }
    
    // If first visit and on the home page, offer to start tutorial
    if (firstVisit && window.location.pathname === '/') {
        setTimeout(function() {
            offerTutorial();
        }, 2000);
    }
});

/**
 * Add the tutorial button to the navigation bar
 */
function addTutorialButton() {
    const navbar = document.querySelector('.navbar-nav');
    if (!navbar) return;
    
    const tutorialButton = document.createElement('li');
    tutorialButton.className = 'nav-item';
    tutorialButton.innerHTML = `
        <a class="nav-link" href="#" id="start-tutorial">
            <i class="bi bi-info-circle-fill me-1"></i> Tutorial
        </a>
    `;
    navbar.appendChild(tutorialButton);
    
    // Add event listener
    document.getElementById('start-tutorial').addEventListener('click', function(e) {
        e.preventDefault();
        startTutorial();
    });
}

/**
 * Offer to start the tutorial for first-time users
 */
function offerTutorial() {
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap is not loaded. Cannot show tutorial modal.');
        return;
    }
    
    // Create modal element if it doesn't exist
    if (!document.getElementById('tutorial-offer-modal')) {
        const modalHTML = `
            <div class="modal fade" id="tutorial-offer-modal" tabindex="-1" aria-labelledby="tutorialModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="tutorialModalLabel">Welcome to Shadow Systems Theory</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Welcome to the Shadow Systems Theory OSINT platform. Would you like to take a quick tutorial to learn how to use this tool?</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="skip-tutorial">Skip Tutorial</button>
                            <button type="button" class="btn btn-primary" id="accept-tutorial">Show Tutorial</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Append modal to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Add event listeners
        document.getElementById('skip-tutorial').addEventListener('click', function() {
            localStorage.setItem('sst_tutorial_completed', 'true');
        });
        
        document.getElementById('accept-tutorial').addEventListener('click', function() {
            const modal = bootstrap.Modal.getInstance(document.getElementById('tutorial-offer-modal'));
            modal.hide();
            startTutorial();
        });
    }
    
    // Show the modal
    const tutorialModal = new bootstrap.Modal(document.getElementById('tutorial-offer-modal'));
    tutorialModal.show();
}

/**
 * Start the interactive tutorial walkthrough
 */
function startTutorial() {
    // If driver.js isn't loaded, load it first
    if (typeof driver === 'undefined') {
        const driverScript = document.createElement('script');
        driverScript.src = 'https://cdn.jsdelivr.net/npm/driver.js@1.0.1';
        document.head.appendChild(driverScript);
        
        const driverStyles = document.createElement('link');
        driverStyles.rel = 'stylesheet';
        driverStyles.href = 'https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.min.css';
        document.head.appendChild(driverStyles);
        
        driverScript.onload = function() {
            initializeTutorial();
        };
    } else {
        initializeTutorial();
    }
}

/**
 * Initialize the tutorial steps
 */
function initializeTutorial() {
    console.log("Initializing tutorial...");
    
    // If driver.js isn't loaded yet, wait for it
    if (typeof driver === 'undefined') {
        console.log("Driver.js not loaded, waiting...");
        setTimeout(initializeTutorial, 500);
        return;
    }
    
    console.log("Creating driver instance...");
    // Create driver instance
    const driverObj = new driver.Driver({
        animate: true,
        opacity: 0.75,
        padding: 10,
        allowClose: true,
        overlayClickNext: false,
        doneBtnText: 'Finish',
        closeBtnText: 'Skip',
        nextBtnText: 'Next',
        prevBtnText: 'Previous',
        onReset: () => {
            localStorage.setItem('sst_tutorial_completed', 'true');
        }
    });
    
    // Define the steps for the tutorial
    const tutorialSteps = buildTutorialSteps();
    console.log("Tutorial steps:", tutorialSteps);
    
    if (tutorialSteps.length === 0) {
        console.error("No tutorial steps available for this page.");
        alert("Tutorial isn't available for this page yet. Please try on the home page.");
        return;
    }
    
    // Start the tutorial
    driverObj.defineSteps(tutorialSteps);
    driverObj.start();
}

/**
 * Build the tutorial steps based on current page
 */
function buildTutorialSteps() {
    const currentPath = window.location.pathname;
    let steps = [];
    
    // Common introduction step
    steps.push({
        element: '.navbar-brand',
        popover: {
            title: 'Welcome to Shadow Systems Theory',
            description: 'This platform implements specialized analytical modules to detect patterns in textual information. Let\'s walk through the main features.',
            position: 'bottom'
        }
    });
    
    // Homepage-specific steps
    if (currentPath === '/') {
        steps = steps.concat([
            {
                element: '#analyze-text-btn',
                popover: {
                    title: 'Text Analysis',
                    description: 'This is where you can submit text for analysis using the Field Distortion Engine.',
                    position: 'bottom'
                }
            },
            {
                element: '#theoryDropdown',
                popover: {
                    title: 'Theory Documentation',
                    description: 'Learn about the underlying theories and methodologies that power our analysis.',
                    position: 'bottom'
                }
            },
            {
                element: '#applicationsDropdown',
                popover: {
                    title: 'Applications',
                    description: 'Explore practical applications of Shadow Systems Theory in various fields.',
                    position: 'bottom'
                }
            },
            {
                element: '#outreachDropdown',
                popover: {
                    title: 'Get Involved',
                    description: 'Find ways to contribute or access resources for support.',
                    position: 'bottom'
                }
            }
        ]);
    }
    
    // Analysis page steps
    if (currentPath === '/analyze') {
        steps = steps.concat([
            {
                element: '#text-input',
                popover: {
                    title: 'Text Input',
                    description: 'Enter or paste the text you want to analyze here. The Field Distortion Engine works best with texts containing at least 150 words.',
                    position: 'top'
                }
            },
            {
                element: 'button[type="submit"]',
                popover: {
                    title: 'Submit for Analysis',
                    description: 'Click this button to process your text through the Field Distortion Engine.',
                    position: 'bottom'
                }
            }
        ]);
    }
    
    // Results page steps
    if (currentPath.includes('/results/')) {
        steps = steps.concat([
            {
                element: '.field-classification',
                popover: {
                    title: 'Field Classification',
                    description: 'This indicates the overall classification of the analyzed text based on detected patterns.',
                    position: 'top'
                }
            },
            {
                element: '.metrics-panel',
                popover: {
                    title: 'Analysis Metrics',
                    description: 'These key metrics show different aspects of the textual analysis, including entropy, recursion, symbol density, and echo patterns.',
                    position: 'left'
                }
            },
            {
                element: '.visualization-container',
                popover: {
                    title: 'Visualizations',
                    description: 'These charts help you visualize different aspects of the analysis. Hover over elements to see more details.',
                    position: 'top'
                }
            }
        ]);
    }
    
    // Visualizations page steps
    if (currentPath === '/visualizations') {
        steps = steps.concat([
            {
                element: '.visualization-gallery',
                popover: {
                    title: 'Visualization Examples',
                    description: 'Explore different visualization types that help interpret Field Distortion Engine analysis results.',
                    position: 'top'
                }
            },
            {
                element: '.chart-explanation',
                popover: {
                    title: 'Chart Explanations',
                    description: 'Hover over these icons to get detailed explanations of what each visualization represents.',
                    position: 'bottom'
                }
            }
        ]);
    }
    
    // Final step - common to all pages
    steps.push({
        element: '#start-tutorial',
        popover: {
            title: 'Tutorial Available Anytime',
            description: 'You can restart this tutorial at any time by clicking this button in the navigation bar.',
            position: 'bottom'
        }
    });
    
    // Filter out steps where the elements don't exist on the current page
    return steps.filter(step => {
        return document.querySelector(step.element) !== null;
    });
}
