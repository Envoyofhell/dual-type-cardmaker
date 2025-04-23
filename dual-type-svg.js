// Global dual type variables
let isDualType = false;
let secondType = '';

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', initDualType);

function initDualType() {
    console.log("Initializing dual type functionality");
    setupDualTypeToggle();
    setupSecondTypeSelection();
}

// Set up the dual type toggle checkbox
function setupDualTypeToggle() {
    const dualTypeToggle = document.getElementById('dual-type-toggle');
    console.log("Dual type toggle found:", !!dualTypeToggle);
    
    if (dualTypeToggle) {
        // Force initial state
        dualTypeToggle.checked = false;
        isDualType = false;
        
        // Add event listener
        dualTypeToggle.addEventListener('click', function() {
            isDualType = this.checked;
            console.log("Dual type toggled:", isDualType);
            
            const secondTypeSelector = document.getElementById('second-type-selector');
            if (secondTypeSelector) {
                if (isDualType) {
                    secondTypeSelector.classList.remove('hidden');
                    setupCardLayers();
                    console.log("Second type selector shown");
                } else {
                    secondTypeSelector.classList.add('hidden');
                    removeSecondLayer();
                    console.log("Second type selector hidden");
                }
            } else {
                console.error("Second type selector not found");
            }
        });
    } else {
        console.error("Dual type toggle checkbox not found!");
    }
}

// Set up second type selection
function setupSecondTypeSelection() {
    const typeElements = document.querySelectorAll('.select-second-type');
    console.log("Found", typeElements.length, "second type elements");
    
    typeElements.forEach(element => {
        element.addEventListener('click', function() {
            // Remove highlight from all types
            typeElements.forEach(el => el.classList.remove('highlight'));
            
            // Add highlight to selected type
            this.classList.add('highlight');
            
            // Get the type value
            secondType = this.getAttribute('value');
            console.log("Second type selected:", secondType);
            
            // Update the card if dual type is enabled
            if (isDualType) {
                updateSecondLayer();
            }
        });
    });
}

// Set up the card layers for dual type
function setupCardLayers() {
    const cardContainer = document.querySelector('#card');
    if (!cardContainer) {
        console.error("Card container not found");
        return;
    }
    
    // Check if second layer already exists
    if (document.getElementById('second-card-layer')) {
        return;
    }
    
    console.log("Setting up card layers");

    // Create second layer div that will hold the second type background
    const secondLayer = document.createElement('div');
    secondLayer.id = 'second-card-layer';
    secondLayer.className = 'card-layer';
    secondLayer.style.position = 'absolute';
    secondLayer.style.top = '0';
    secondLayer.style.left = '0';
    secondLayer.style.width = '100%';
    secondLayer.style.height = '100%';
    secondLayer.style.zIndex = '4'; // Below the SVG mask
    
    // Create the clip path using the SVG 
    secondLayer.style.clipPath = 'polygon(0 0, 100% 0, 0 100%)';
    
    // Initially hide until second type is selected
    secondLayer.style.visibility = 'hidden';
    
    // Add to card container
    cardContainer.appendChild(secondLayer);
    
    // If second type is already selected, update it
    if (secondType) {
        updateSecondLayer();
    }
}

// Update the second layer based on selected type
function updateSecondLayer() {
    if (!secondType) {
        console.warn("No second type selected");
        return;
    }
    
    const secondLayer = document.getElementById('second-card-layer');
    if (!secondLayer) {
        console.error("Second layer not found");
        return;
    }
    
    console.log("Updating second layer with type:", secondType);
    
    // Get current stage
    const stage = document.getElementById('stage')?.value || 'basic';
    const stageFormatted = stage === 'basic' ? 'Basic' : 
                          stage === 'stage-1' ? 'Stage 1' : 'Stage 2';
    const stageClass = stage === 'basic' ? 'Basic' : 
                       stage === 'stage-1' ? 'Stage1' : 'Stage2';
    
    // Get second type formatted
    const secondTypeFormatted = formatTypeName(secondType);
    
    // Create background image path
    const bgImage = `img/${stageFormatted}/SS_${stageClass}_${secondTypeFormatted}.png`;
    console.log("Using background image:", bgImage);
    
    // Apply background image
    secondLayer.style.backgroundImage = `url(${bgImage})`;
    secondLayer.style.backgroundSize = 'contain';
    secondLayer.style.backgroundRepeat = 'no-repeat';
    secondLayer.style.backgroundPosition = 'center';
    secondLayer.style.visibility = 'visible';
}

// Format type name for file paths
function formatTypeName(type) {
    if (!type) return '';
    
    switch(type) {
        case 'normal':
            return 'Colorless';
        case 'electric':
            return 'Lightning';
        default:
            return type.charAt(0).toUpperCase() + type.slice(1);
    }
}

// Remove the second layer
function removeSecondLayer() {
    const secondLayer = document.getElementById('second-card-layer');
    if (secondLayer) {
        secondLayer.parentNode.removeChild(secondLayer);
        console.log("Second layer removed");
    }
}

// Function to update when stage changes
function updateOnStageChange(newStage) {
    if (isDualType && secondType) {
        console.log("Stage changed to:", newStage);
        updateSecondLayer();
    }
}

// Expose some functions for integration with existing code
window.dualTypeSimple = {
    updateOnStageChange,
    updateSecondLayer,
    isDualTypeEnabled: () => isDualType
};