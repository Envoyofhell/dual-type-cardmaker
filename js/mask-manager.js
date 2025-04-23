// mask-manager.js - Centralized logic for handling dual-type masks

let maskSelectorElement = null;
let currentSelectedMaskUrl = '';

document.addEventListener('DOMContentLoaded', initMaskManager);

function initMaskManager() {
    console.log("Initializing Mask Manager v3"); // Version log
    maskSelectorElement = document.getElementById('mask-selector');

    if (maskSelectorElement) {
        currentSelectedMaskUrl = maskSelectorElement.value;
        console.log("Mask Manager: Initial mask URL set to:", currentSelectedMaskUrl);
        maskSelectorElement.addEventListener('change', handleMaskChange);
        // Apply initial style if needed (e.g., on load with saved data)
        // Note: This relies on dual-type-simple.js creating the layer first
        // if (document.getElementById('second-card-layer')) {
        //    applyCurrentMaskStyle();
        // }
    } else {
        console.error("Mask Manager: Mask selector element (#mask-selector) not found!");
        currentSelectedMaskUrl = ''; // Default to clip-path if selector missing
    }
}

function handleMaskChange() {
    currentSelectedMaskUrl = maskSelectorElement.value;
    console.log(`Mask Manager: Selection changed to "${currentSelectedMaskUrl}"`);
    applyCurrentMaskStyle();
}

function applyCurrentMaskStyle() {
    const secondLayer = document.getElementById('second-card-layer');
    if (secondLayer) {
        // Use requestAnimationFrame to apply styles on the next render cycle
        requestAnimationFrame(() => {
             if (document.getElementById('second-card-layer')) { // Check again inside rAF
                 applyMaskStyle(secondLayer, currentSelectedMaskUrl);
             } else {
                 console.log("applyCurrentMaskStyle (rAF): Layer removed before style application.");
             }
        });
    } else {
         // console.log("applyCurrentMaskStyle: No second layer currently exists.");
    }
}

/**
 * Applies the appropriate mask or clip-path style to a target element.
 * @param {HTMLElement} targetElement The DOM element to style.
 * @param {string} maskUrl The URL of the mask image file, or an empty string to use the default clip-path.
 */
function applyMaskStyle(targetElement, maskUrl) {
    if (!targetElement) {
        console.error("applyMaskStyle: Target element is invalid.");
        return;
    }

    console.log(`Applying styles to element ${targetElement.id || 'undefined'}. Mask URL: "${maskUrl}"`);

    // --- Force Reset Styles ---
    // Setting to 'initial' or 'unset' might be more effective than 'none' sometimes
    targetElement.style.setProperty('mask-image', 'initial', 'important');
    targetElement.style.setProperty('-webkit-mask-image', 'initial', 'important');
    targetElement.style.setProperty('clip-path', 'initial', 'important');
    targetElement.style.setProperty('-webkit-clip-path', 'initial', 'important');
    targetElement.style.setProperty('mask-size', 'initial', 'important');
    targetElement.style.setProperty('-webkit-mask-size', 'initial', 'important');
    targetElement.style.setProperty('mask-repeat', 'initial', 'important');
    targetElement.style.setProperty('-webkit-mask-repeat', 'initial', 'important');
    targetElement.style.setProperty('mask-position', 'initial', 'important');
    targetElement.style.setProperty('-webkit-mask-position', 'initial', 'important');

    // Force reflow/repaint (might help some browsers recognize style changes)
    void targetElement.offsetHeight;


    // --- Apply selected style ---
    if (maskUrl && maskUrl !== "") {
        // Use mask-image if a URL is provided
        console.log(`---> Applying MASK styles: url("${maskUrl}")`);
        targetElement.style.setProperty('mask-image', `url("${maskUrl}")`, 'important');
        targetElement.style.setProperty('-webkit-mask-image', `url("${maskUrl}")`, 'important');
        targetElement.style.setProperty('mask-size', 'contain', 'important');
        targetElement.style.setProperty('-webkit-mask-size', 'contain', 'important');
        targetElement.style.setProperty('mask-repeat', 'no-repeat', 'important');
        targetElement.style.setProperty('-webkit-mask-repeat', 'no-repeat', 'important');
        targetElement.style.setProperty('mask-position', 'center', 'important');
        targetElement.style.setProperty('-webkit-mask-position', 'center', 'important');
        // Ensure clip-path is explicitly none
        targetElement.style.setProperty('clip-path', 'none', 'important');
        targetElement.style.setProperty('-webkit-clip-path', 'none', 'important');

    } else {
        // Use clip-path if maskUrl is empty ("" - the "None" or default option)
        console.log("---> Applying default CLIP-PATH styles.");
         // Ensure mask is explicitly none
        targetElement.style.setProperty('mask-image', 'none', 'important');
        targetElement.style.setProperty('-webkit-mask-image', 'none', 'important');
        // Apply default diagonal split using clip-path
        targetElement.style.setProperty('clip-path', 'polygon(0 0, 100% 0, 0 100%)', 'important');
        targetElement.style.setProperty('-webkit-clip-path', 'polygon(0 0, 100% 0, 0 100%)', 'important');
    }

     // Log computed style after a very short delay
     setTimeout(() => {
        if (document.body.contains(targetElement)) {
            try {
                const computedStyle = window.getComputedStyle(targetElement);
                const computedMask = computedStyle.getPropertyValue('mask-image') || computedStyle.getPropertyValue('-webkit-mask-image');
                const computedClip = computedStyle.getPropertyValue('clip-path') || computedStyle.getPropertyValue('-webkit-clip-path');
                console.log(`FINAL Computed mask for ${targetElement.id || 'element'}:`, computedMask);
                console.log(`FINAL Computed clip for ${targetElement.id || 'element'}:`, computedClip);
            } catch (e) {
                console.warn("Could not get computed style for target element:", e);
            }
        }
    }, 100); // Increased delay slightly for computed style check
}

// Function to get the currently selected mask URL
function getCurrentMaskUrl() {
    if (maskSelectorElement) {
        return maskSelectorElement.value;
    }
    return currentSelectedMaskUrl; // Fallback
}

// --- Expose necessary functions globally ---
window.maskManager = {
    applyMaskStyle,
    applyCurrentMaskStyle,
    getCurrentMaskUrl,
    initMaskManager
};
