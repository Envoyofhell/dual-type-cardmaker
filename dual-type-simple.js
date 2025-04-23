// Global dual type variables
let isDualType = false;
let secondType = '';

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', initDualType);
window.onload = initDualType; // Backup initialization

function initDualType() {
    console.log("Initializing dual type functionality");
    setupDualTypeToggle();
    setupSecondTypeSelection();
}

// Set up the dual type toggle checkbox
function setupDualTypeToggle() {
    const dualTypeToggle = document.getElementById('dual-type-toggle');
    
    if (dualTypeToggle) {
        // Force initial state
        dualTypeToggle.checked = false;
        isDualType = false;
        
        // Add event listener
        dualTypeToggle.addEventListener('click', function() {
            isDualType = this.checked;
            
            const secondTypeSelector = document.getElementById('second-type-selector');
            if (secondTypeSelector) {
                if (isDualType) {
                    secondTypeSelector.classList.remove('hidden');
                    if (secondType) {
                        updateSecondLayer();
                    }
                } else {
                    secondTypeSelector.classList.add('hidden');
                    removeSecondLayer();
                }
            }
        });
    }
}

// Set up second type selection
function setupSecondTypeSelection() {
    const typeElements = document.querySelectorAll('.select-second-type');
    
    typeElements.forEach(element => {
        element.addEventListener('click', function() {
            // Remove highlight from all types
            typeElements.forEach(el => el.classList.remove('highlight'));
            
            // Add highlight to selected type
            this.classList.add('highlight');
            
            // Get the type value
            secondType = this.getAttribute('value');
            
            // Update the card if dual type is enabled
            if (isDualType) {
                updateSecondLayer();
            }
        });
    });
}

// Update the second layer based on selected type
function updateSecondLayer() {
    if (!secondType) return;
    
    // First remove any existing layer
    removeSecondLayer();
    
    // Get card container
    const cardContainer = document.querySelector('#card');
    if (!cardContainer) return;
    
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
    
    // Create overlay div
    const overlay = document.createElement('div');
    overlay.id = 'second-card-layer';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundImage = `url(${bgImage})`;
    overlay.style.backgroundSize = 'contain';
    overlay.style.backgroundRepeat = 'no-repeat';
    overlay.style.backgroundPosition = 'center';
    overlay.style.clipPath = 'polygon(0 0, 100% 0, 0 100%)';  // Diagonal split
    overlay.style.webkitClipPath = 'polygon(0 0, 100% 0, 0 100%)';  
    overlay.style.zIndex = '1'; // Lower z-index so card content stays on top
    overlay.style.pointerEvents = 'none';  // Allow clicks to pass through
    
    // Add to card container
    cardContainer.appendChild(overlay);
    
    // Ensure card contents maintain styling and are above the layers
    preserveCardFormatting(cardContainer);
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
    }
}

// Make sure card elements keep original positioning and appear on top
function preserveCardFormatting(card) {
    // Ensure card container is visible and on top
    const cardContainer = card.querySelector('.card-container');
    if (cardContainer) {
        cardContainer.style.display = 'block';
        cardContainer.style.position = 'relative';
        cardContainer.style.zIndex = '5'; // Higher than background layers
    }
    
    // Fix and elevate card top section
    const cardTop = card.querySelector('.card-top');
    if (cardTop) {
        cardTop.style.position = 'relative';
        cardTop.style.zIndex = '6';
    }
    
    // Fix and elevate card bottom section
    const cardBottom = card.querySelector('.card-bottom');
    if (cardBottom) {
        cardBottom.style.position = 'relative';
        cardBottom.style.zIndex = '6';
    }
    
    // Fix name positioning
    const cardName = card.querySelector('.card-name');
    if (cardName) {
        cardName.style.position = 'relative';
        cardName.style.fontSize = 'min(33.6px, 2.1vw)';
        cardName.style.transform = 'scaleX(0.9) translateX(-7%)';
        cardName.style.zIndex = '7';
    }
    
    // Fix HP positioning
    const hpContainer = card.querySelector('.hp-container');
    if (hpContainer) {
        hpContainer.style.position = 'relative';
        hpContainer.style.top = '0.1vw';
        hpContainer.style.zIndex = '7';
    }
    
    const cardHp = card.querySelector('.card-hp');
    if (cardHp) {
        cardHp.style.position = 'relative';
        cardHp.style.fontSize = 'min(4.8px, 0.3vw)';
        cardHp.style.fontFamily = "'Lato', 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif";
        cardHp.style.display = 'inline-block';
        cardHp.style.left = '0.35vw';
    }
    
    const hp = card.querySelector('.hp');
    if (hp) {
        hp.style.fontSize = 'min(28.8px, 1.8vw)';
        hp.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
        hp.style.transform = 'scaleX(0.9) translateX(5%)';
        hp.style.fontWeight = 'bold';
        hp.style.display = 'inline-block';
    }
    
    // Ensure attacks are above background
    const attacks = card.querySelectorAll('.attack');
    attacks.forEach(attack => {
        attack.style.position = 'relative';
        attack.style.zIndex = '7';
    });
    
    // Ensure footer elements are above background
    const footer = card.querySelector('.card-footer');
    if (footer) {
        footer.style.position = 'relative';
        footer.style.zIndex = '7';
    }
}

// Function to update when stage changes
function updateOnStageChange(newStage) {
    if (isDualType && secondType) {
        updateSecondLayer();
    }
}

// Expose some functions for integration with existing code
window.dualTypeSimple = {
    updateOnStageChange,
    updateSecondLayer,
    isDualTypeEnabled: () => isDualType
};