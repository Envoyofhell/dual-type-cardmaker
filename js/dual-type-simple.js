// Global dual type variables
let isDualType = false;
let secondType = '';
let currentMaskUrl = 'img/mask.png'; // Default mask path

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', initDualType);
window.onload = initDualType; // Backup initialization

function initDualType() {
    console.log("Initializing dual type functionality");
    setupDualTypeToggle();
    setupSecondTypeSelection();
    setupMaskSelection();
    // Initial update handled by toggling logic if needed
}

// Set up the dual type toggle checkbox
function setupDualTypeToggle() {
    const dualTypeToggle = document.getElementById('dual-type-toggle');
    if (dualTypeToggle) {
        dualTypeToggle.checked = false; // Start unchecked
        isDualType = false;

        dualTypeToggle.addEventListener('click', function() {
            isDualType = this.checked;
            const secondTypeSelector = document.getElementById('second-type-selector');

            if (isDualType) {
                if(secondTypeSelector) secondTypeSelector.classList.remove('hidden');
                // Only update layer if a second type is already selected
                if (secondType) {
                    updateSecondLayer();
                }
            } else {
                 if(secondTypeSelector) secondTypeSelector.classList.add('hidden');
                removeSecondLayer();
            }
        });
    }
}

// Set up second type selection
function setupSecondTypeSelection() {
    const typeElements = document.querySelectorAll('.select-second-type');
    typeElements.forEach(element => {
        element.addEventListener('click', function() {
            typeElements.forEach(el => el.classList.remove('highlight'));
            this.classList.add('highlight');
            secondType = this.getAttribute('value');
            if (isDualType) {
                updateSecondLayer(); // This will create/update the layer and apply the current mask
            }
        });
    });
}

// Set up mask selection dropdown
function setupMaskSelection() {
    const maskSelector = document.getElementById('mask-selector');
    if (maskSelector) {
        // Initialize global variable with the selector's current value
        currentMaskUrl = maskSelector.value;

        maskSelector.addEventListener('change', function() {
            currentMaskUrl = this.value; // Update the global mask URL
            updateMaskOnLayer(); // Apply the newly selected mask *only if the layer exists*
        });
    } else {
        console.warn("Mask selector dropdown not found.");
    }
}

// Apply mask properties to the second layer (if it exists)
function updateMaskOnLayer() {
    const secondLayer = document.getElementById('second-card-layer');
    if (!secondLayer) return; // Don't do anything if the layer isn't there

    console.log("Attempting to apply mask:", currentMaskUrl);

    // Check if a specific mask is selected (assuming default 'img/mask.png' might not be a real mask)
    // Modify this condition if 'img/mask.png' *is* intended as the default visual mask
    const useSpecificMask = currentMaskUrl && currentMaskUrl !== 'img/mask.png'; // Example condition

    if (useSpecificMask) {
        console.log("Applying specific mask:", currentMaskUrl);
        // Apply mask-image properties
        secondLayer.style.maskImage = `url(${currentMaskUrl})`;
        secondLayer.style.webkitMaskImage = `url(${currentMaskUrl})`;
        secondLayer.style.maskSize = 'contain';
        secondLayer.style.webkitMaskSize = 'contain';
        secondLayer.style.maskRepeat = 'no-repeat';
        secondLayer.style.webkitMaskRepeat = 'no-repeat';
        secondLayer.style.maskPosition = 'center';
        secondLayer.style.webkitMaskPosition = 'center';

        // Remove clip-path when using a specific mask
        secondLayer.style.clipPath = 'none';
        secondLayer.style.webkitClipPath = 'none';
    } else {
        console.log("Applying default clip-path visual split.");
        // If no specific mask, remove mask styles and apply default clip-path
        secondLayer.style.maskImage = 'none';
        secondLayer.style.webkitMaskImage = 'none';

        // Apply default diagonal split using clip-path
        secondLayer.style.clipPath = 'polygon(0 0, 100% 0, 0 100%)';
        secondLayer.style.webkitClipPath = 'polygon(0 0, 100% 0, 0 100%)';
    }
}


// Find the updateSecondLayer function and update it
function updateSecondLayer() {
    if (!secondType || !isDualType) {
      removeSecondLayer();
      return;
    }

    removeSecondLayer(); // Remove existing layer first

    const cardContainer = document.querySelector('#card');
    if (!cardContainer) {
        console.error("Card container not found.");
        return;
    }

    const stageSelect = document.getElementById('stage');
    const stage = stageSelect ? stageSelect.value : 'basic';

    let bgImage = '';
    const currentDualSet = window.dualTypeSet || 'Classic'; // Default to Classic if undefined
    const setConfig = window.SETS_CONFIG?.[currentDualSet]; // Get config for the dual set

    console.log(`Updating second layer. Set: ${currentDualSet}, Type: ${secondType}, Stage: ${stage}`);

    // --- Revised Path Logic ---
    if (setConfig && !setConfig.cssClassBased && window.CARD_SETS?.[currentDualSet]) {
        // Try direct lookup in CARD_SETS first for image-based sets
        try {
            const typeData = window.CARD_SETS[currentDualSet].types[secondType]; // Use secondType directly as key
            const stageData = typeData?.[stage];
            bgImage = stageData?.path;

            if (bgImage) {
                console.log(`Found path in CARD_SETS: ${bgImage}`);
            } else {
                console.warn(`Image path NOT found in CARD_SETS for: Set='${currentDualSet}', Type='${secondType}', Stage='${stage}'. Check cardsets.js and file names.`);
                // Optional: You could attempt a fallback here using tryMultiplePathFormats if desired,
                // but it's often better to fix the data source (cardsets.js / file names)
                // bgImage = window.tryMultiplePathFormats(currentDualSet, secondType, stage)[0]; // Example fallback (less reliable)
            }
        } catch (e) {
             console.error(`Error accessing CARD_SETS for ${currentDualSet}/${secondType}/${stage}:`, e);
        }

    } else {
        // Fallback logic (e.g., for CSS-based sets like Classic, or if CARD_SETS entry is missing)
        console.log(`Using fallback logic for second layer (Set: ${currentDualSet}, CSS Based: ${setConfig?.cssClassBased}, CARD_SETS missing?: ${!window.CARD_SETS?.[currentDualSet]})`);
        // Assuming Classic uses CSS classes primarily (as suggested by set-selector.js updateCardFromSet logic)
        // If you *need* a fallback *image* path for Classic dual types, define it explicitly here.
        // Example: Using the old hardcoded path (verify this path is correct for your Classic assets if needed)
        const stageFormatted = stage === 'basic' ? 'Basic' :
                             stage === 'stage-1' ? 'Stage 1' : 'Stage 2';
        const stageClass = stage === 'basic' ? 'Basic' :
                           stage === 'stage-1' ? 'Stage1' : 'Stage2';
        // Use formatTypeName ONLY for this specific Classic fallback path construction
        const secondTypeFormatted = formatTypeName(secondType);
        bgImage = `img/${stageFormatted}/SS_${stageClass}_${secondTypeFormatted}.png`;
        console.warn(`Using fallback image path for second layer: ${bgImage}. Verify this path if set is CSS based.`);
    }
    // --- End Revised Path Logic ---


    if (!bgImage) {
        console.error("Could not determine a valid background image for the second layer. Aborting overlay creation.");
        return; // Stop if no image path could be found
    }

    const overlay = document.createElement('div');
    overlay.id = 'second-card-layer';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    // IMPORTANT: Ensure the path is correctly quoted in the url()
    overlay.style.backgroundImage = `url('${bgImage.replace(/'/g, "%27")}')`; // Basic escaping for single quotes in path
    overlay.style.backgroundSize = 'contain'; // Or 'cover' depending on needs
    overlay.style.backgroundRepeat = 'no-repeat';
    overlay.style.backgroundPosition = 'center';
    overlay.style.zIndex = '1'; // Ensure it's above the base card but below text/UI elements
    overlay.style.pointerEvents = 'none'; // Allow clicks to pass through

    cardContainer.appendChild(overlay);
    console.log(`Appended second layer with image: ${bgImage}`);

    // Apply mask/clip-path AFTER appending
    updateMaskOnLayer();
    preserveCardFormatting(cardContainer); // Ensure main card elements are still visible
}

// Format type name for file paths
function formatTypeName(type) {
    if (!type) return '';
    switch(type) {
        case 'normal': return 'Colorless';
        case 'electric': return 'Lightning';
        default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
}

// Remove the second layer
function removeSecondLayer() {
    const secondLayer = document.getElementById('second-card-layer');
    if (secondLayer && secondLayer.parentNode) { // Added parentNode check
        secondLayer.parentNode.removeChild(secondLayer);
    }
}

// Make sure card elements keep original positioning and appear on top
function preserveCardFormatting(card) {
    // (Keep this function as provided previously - ensures z-index etc.)
    const cardContainer = card.querySelector('.card-container');
    if (cardContainer) {
        cardContainer.style.display = 'block';
        cardContainer.style.position = 'relative';
        cardContainer.style.zIndex = '5';
    }
    const cardTop = card.querySelector('.card-top');
    if (cardTop) {
        cardTop.style.position = 'relative';
        cardTop.style.zIndex = '6';
    }
    const cardBottom = card.querySelector('.card-bottom');
    if (cardBottom) {
        cardBottom.style.position = 'relative';
        cardBottom.style.zIndex = '6';
    }
    const cardName = card.querySelector('.card-name');
    if (cardName) {
        cardName.style.position = 'relative';
        cardName.style.fontSize = 'min(33.6px, 2.1vw)';
        cardName.style.transform = 'scaleX(0.9) translateX(-7%)';
        cardName.style.zIndex = '7';
    }
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
    const attacks = card.querySelectorAll('.attack');
    attacks.forEach(attack => {
        attack.style.position = 'relative';
        attack.style.zIndex = '7';
    });
    const footer = card.querySelector('.card-footer');
    if (footer) {
        footer.style.position = 'relative';
        footer.style.zIndex = '7';
    }
}

// Function to update when stage changes
function updateOnStageChange(newStage) {
    if (isDualType && secondType) {
        updateSecondLayer(); // Recreate layer with correct stage bg and apply mask/clip
    }
}

// Expose functions
window.dualTypeSimple = {
    updateOnStageChange,
    updateSecondLayer,
    removeSecondLayer,
    updateMaskOnLayer, // Changed name for clarity
    isDualTypeEnabled: () => isDualType,
    getCurrentMaskUrl: () => currentMaskUrl
};