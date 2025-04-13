/**
 * Main JavaScript file for the SST OSINT application
 */

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize Bootstrap popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
});

// Add keyboard navigation handling for the application
document.addEventListener('keydown', function(event) {
    // If user presses '/' anywhere on the page, focus the search box if it exists
    if (event.key === '/' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
        const searchBox = document.getElementById('search-input');
        if (searchBox) {
            event.preventDefault();
            searchBox.focus();
        }
    }
});

// Enhance dropdown accessibility
document.addEventListener('DOMContentLoaded', function() {
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    
    dropdownItems.forEach(item => {
        item.addEventListener('keydown', function(event) {
            // If Enter key is pressed
            if (event.key === 'Enter') {
                event.preventDefault();
                item.click();
            }
        });
    });
});

// Make accordion accessible via keyboard
document.addEventListener('DOMContentLoaded', function() {
    const accordionButtons = document.querySelectorAll('.accordion-button');
    
    accordionButtons.forEach(button => {
        button.addEventListener('keydown', function(event) {
            // If Enter or Space key is pressed
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                button.click();
            }
        });
    });
});
