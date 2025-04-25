// mask-manager-enhanced.js - Replaces mask-manager.js with improved functionality

import { 
    applyMaskAndBlendToLayer, 
    populateMaskSelector, 
    createBlendModeSelector,
    createDefaultMaskImages
} from './dualTypeUtils.js';

// Default mask and blend settings
let maskSelectorElement = null;
let blendModeSelectorElement = null;
let currentSelectedMaskUrl = 'img/mask.png'; // Default mask path
let currentSelectedBlendMode = 'normal'; // Default blend mode

/**
 * Initialize the enhanced mask manager system
 * Replaces the original mask-manager.js initialization
 */
function initEnhancedMaskManager() {
    console.log("Initializing Enhanced Mask Manager");
    
    // Create default mask images for use in the system
    createDefaultMaskImages();
    
    // Find the mask selector dropdown
    maskSelectorElement = document.getElementById('mask-selector');
    
    if (maskSelectorElement) {
        // Add options to the dropdown
        populateMaskSelector(maskSelectorElement);
        
        // Get the current selection
        currentSelectedMaskUrl = maskSelectorElement.value;
        console.log("Initial mask URL set to:", currentSelectedMaskUrl);
        
        // Add event listener for changes
        maskSelectorElement.addEventListener('change', handleMaskChange);
        
        // Create and add the blend mode selector
        const maskContainer = maskSelectorElement.closest('.mask-selection-container');
        if (maskContainer) {
            const blendModeContainer = createBlendModeSelector();
            maskContainer.parentNode.insertBefore(blendModeContainer, maskContainer.nextSibling);
            
            // Get a reference to the blend mode selector
            blendModeSelectorElement = document.getElementById('blend-mode-selector');
            if (blendModeSelectorElement) {
                currentSelectedBlendMode = blendModeSelectorElement.value;
                blendModeSelectorElement.addEventListener('change', handleBlendModeChange);
            }
        }
        
        // Add info tooltip to explain the feature
        addInfoTooltip();
    } else {
        console.error("Mask selector element (#mask-selector) not found!");
        currentSelectedMaskUrl = ''; // Default to clip-path if selector missing
    }
}

/**
 * Handle changes to the mask selection
 */
function handleMaskChange() {
    if (!maskSelectorElement) return;
    
    currentSelectedMaskUrl = maskSelectorElement.value;
    console.log(`Mask selection changed to "${currentSelectedMaskUrl}"`);
    
    // Apply the updated mask to the second layer
    applyCurrentMask();
}

/**
 * Handle changes to the blend mode selection
 */
function handleBlendModeChange() {
    if (!blendModeSelectorElement) return;
    
    currentSelectedBlendMode = blendModeSelectorElement.value;
    console.log(`Blend mode changed to "${currentSelectedBlendMode}"`);
    
    // Apply the updated blend mode to the second layer
    applyCurrentMask();
}

/**
 * Apply the current mask and blend mode settings to the second layer
 */
function applyCurrentMask() {
    const secondLayer = document.getElementById('second-card-layer');
    
    if (secondLayer) {
        // Apply the mask and blend mode to the layer
        requestAnimationFrame(() => {
            if (document.getElementById('second-card-layer')) {
                applyMaskAndBlendToLayer(
                    secondLayer, 
                    currentSelectedMaskUrl, 
                    currentSelectedBlendMode
                );
            } else {
                console.log("Layer removed before style application.");
            }
        });
    }
}

/**
 * Add info tooltip to explain the dual type features
 */
function addInfoTooltip() {
    const maskContainer = maskSelectorElement?.closest('.mask-selection-container');
    if (!maskContainer) return;
    
    // Create info button
    const infoButton = document.createElement('span');
    infoButton.className = 'help-icon';
    infoButton.textContent = '?';
    infoButton.title = 'Click for help about dual type masks';
    
    // Create help content
    const helpContent = document.createElement('div');
    helpContent.className = 'help-content';
    helpContent.innerHTML = `
        <p><strong>Type Mask:</strong> Controls how the secondary type appears on your card.</p>
        <p><strong>Blend Mode:</strong> Changes how the secondary type blends with the primary type.</p>
        <p>Experiment with different combinations to create unique effects!</p>
    `;
    
    // Add click event to toggle help
    infoButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (helpContent.style.display === 'block') {
            helpContent.style.display = 'none';
        } else {
            helpContent.style.display = 'block';
            
            // Position the help content
            const rect = infoButton.getBoundingClientRect();
            helpContent.style.top = `${rect.bottom + 5}px`;
            helpContent.style.left = `${rect.left - 100}px`;
        }
    });
    
    // Close help when clicking elsewhere
    document.addEventListener('click', () => {
        helpContent.style.display = 'none';
    });
    
    // Add elements to the page
    const maskLabel = maskContainer.querySelector('label');
    if (maskLabel) {
        maskLabel.appendChild(infoButton);
        maskContainer.appendChild(helpContent);
    }
}

/**
 * Get the current mask URL
 * @returns {string} The current mask URL
 */
function getCurrentMaskUrl() {
    return currentSelectedMaskUrl;
}

/**
 * Get the current blend mode
 * @returns {string} The current blend mode
 */
function getCurrentBlendMode() {
    return currentSelectedBlendMode;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initEnhancedMaskManager);

// Expose the API for other modules to use
window.maskManager = {
    applyMaskAndBlendToLayer,
    applyCurrentMask,
    getCurrentMaskUrl,
    getCurrentBlendMode,
    initEnhancedMaskManager
};

// Handle integration with dual-type-simple.js
if (window.dualTypeSimple) {
    console.log("Integrating with dualTypeSimple...");
    
    // Store original functions if they exist
    const originalUpdateSecondLayer = window.dualTypeSimple.updateSecondLayer;
    const originalUpdateMaskOnLayer = window.dualTypeSimple.updateMaskOnLayer;
    
    // Override with enhanced versions
    window.dualTypeSimple.updateSecondLayer = function() {
        if (typeof originalUpdateSecondLayer === 'function') {
            originalUpdateSecondLayer.call(window.dualTypeSimple);
        }
        
        // Apply our enhanced mask and blend
        const secondLayer = document.getElementById('second-card-layer');
        if (secondLayer) {
            applyMaskAndBlendToLayer(
                secondLayer,
                getCurrentMaskUrl(),
                getCurrentBlendMode()
            );
        }
    };
    
    window.dualTypeSimple.updateMaskOnLayer = function() {
        const secondLayer = document.getElementById('second-card-layer');
        if (secondLayer) {
            applyMaskAndBlendToLayer(
                secondLayer,
                getCurrentMaskUrl(),
                getCurrentBlendMode()
            );
        }
    };
}