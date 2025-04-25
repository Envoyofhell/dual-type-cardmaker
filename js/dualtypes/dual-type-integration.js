/**
 * Populate the mask selector with mask options
 * 
 * @param {HTMLElement} maskSelector - The mask selector element
 */
function populateMaskSelector(maskSelector) {
    if (!maskSelector) return;
    
    // Clear existing options
    maskSelector.innerHTML = '';
    
    // Default mask options
    const maskOptions = [
        { value: '', label: 'Default Split (Diagonal)' },
        { value: 'img/mask.png', label: 'Standard Mask' },
        { value: 'img/masks/horizontal-split.png', label: 'Horizontal Split' },
        { value: 'img/masks/vertical-split.png', label: 'Vertical Split' },
        { value: 'img/masks/gradient-fade.png', label: 'Gradient Fade' },
        { value: 'img/masks/circle-center.png', label: 'Circle Center' },
        { value: 'img/masks/mask-angle.png', label: 'New Diagonal Pattern' },
        { value: 'img/masks/mask-star.png', label: 'Star Pattern' }
    ];
    
    // Add options to selector
    maskOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        maskSelector.appendChild(optionElement);
    });
}

/**
 * Preload mask images to ensure they're available
 */
function preloadMaskImages() {
    // Define mask patterns using SVGs for flexibility
    const defaultMasks = [
        {
            name: 'img/masks/horizontal-split.png',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <rect width="512" height="256" fill="black"/>
                <rect y="256" width="512" height="256" fill="transparent"/>
            </svg>`
        },
        {
            name: 'img/masks/vertical-split.png',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <rect width="256" height="512" fill="black"/>
                <rect x="256" width="256" height="512" fill="transparent"/>
            </svg>`
        },
        {
            name: 'img/masks/gradient-fade.png',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="black"/>
                        <stop offset="100%" stop-color="transparent"/>
                    </linearGradient>
                </defs>
                <rect width="512" height="512" fill="url(#gradient)"/>
            </svg>`
        },
        {
            name: 'img/masks/circle-center.png',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <circle cx="256" cy="256" r="256" fill="black"/>
            </svg>`
        },
        {
            name: 'img/masks/zigzag.png',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <path d="M0,0 L512,0 L512,512 L0,512 Z" fill="transparent"/>
                <path d="M0,256 L64,192 L128,256 L192,192 L256,256 L320,192 L384,256 L448,192 L512,256 L512,512 L0,512 Z" fill="black"/>
            </svg>`
        },
        {
            name: 'img/masks/dots.png',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <rect width="512" height="512" fill="transparent"/>
                <circle cx="64" cy="64" r="32" fill="black"/>
                <circle cx="192" cy="64" r="32" fill="black"/>
                <circle cx="320" cy="64" r="32" fill="black"/>
                <circle cx="448" cy="64" r="32" fill="black"/>
                <circle cx="128" cy="128" r="32" fill="black"/>
                <circle cx="256" cy="128" r="32" fill="black"/>
                <circle cx="384" cy="128" r="32" fill="black"/>
                <circle cx="64" cy="192" r="32" fill="black"/>
                <circle cx="192" cy="192" r="32" fill="black"/>
                <circle cx="320" cy="192" r="32" fill="black"/>
                <circle cx="448" cy="192" r="32" fill="black"/>
                <circle cx="128" cy="256" r="32" fill="black"/>
                <circle cx="256" cy="256" r="32" fill="black"/>
                <circle cx="384" cy="256" r="32" fill="black"/>
                <circle cx="64" cy="320" r="32" fill="black"/>
                <circle cx="192" cy="320" r="32" fill="black"/>
                <circle cx="320" cy="320" r="32" fill="black"/>
                <circle cx="448" cy="320" r="32" fill="black"/>
                <circle cx="128" cy="384" r="32" fill="black"/>
                <circle cx="256" cy="384" r="32" fill="black"/>
                <circle cx="384" cy="384" r="32" fill="black"/>
                <circle cx="64" cy="448" r="32" fill="black"/>
                <circle cx="192" cy="448" r="32" fill="black"/>
                <circle cx="320" cy="448" r="32" fill="black"/>
                <circle cx="448" cy="448" r="32" fill="black"/>
            </svg>`
        }
    ];
    
    // Create a global object to store the masks
    if (!window.customMasks) {
        window.customMasks = {};
    }
    
    // Create masks using SVG data URLs
    defaultMasks.forEach(mask => {
        // Create SVG blob
        const blob = new Blob([mask.svg], { type: 'image/svg+xml' });
        const dataUrl = URL.createObjectURL(blob);
        
        // Store in global object
        window.customMasks[mask.name] = dataUrl;
        
        // Preload the image
        const img = new Image();
        img.src = dataUrl;
        
        console.log(`Preloaded mask: ${mask.name}`);
    });
}

/**
 * Set up event listeners for dual type functionality
 */
function setupEventListeners() {
    // Listen for mask selector changes
    const maskSelector = document.getElementById('mask-selector');
    if (maskSelector) {
        maskSelector.addEventListener('change', function() {
            applyCurrentMaskAndBlend();
        });
    }
    
    // Listen for blend mode selector changes
    const blendModeSelector = document.getElementById('blend-mode-selector');
    if (blendModeSelector) {
        blendModeSelector.addEventListener('change', function() {
            applyCurrentMaskAndBlend();
        });
    }
    
    // Listen for stage changes (to update second layer when stage changes)
    const stageSelect = document.getElementById('stage');
    if (stageSelect) {
        stageSelect.addEventListener('change', function() {
            // Check if dual type is enabled
            if (window.isDualType && window.secondType) {
                // Delay to ensure the main card updates first
                setTimeout(() => {
                    if (window.dualTypeSimple && typeof window.dualTypeSimple.updateSecondLayer === 'function') {
                        window.dualTypeSimple.updateSecondLayer();
                    }
                }, 100);
            }
        });
    }
}

/**
 * Apply the current mask and blend mode to the second layer
 */
function applyCurrentMaskAndBlend() {
    // Get the current selections
    const maskUrl = document.getElementById('mask-selector')?.value || '';
    const blendMode = document.getElementById('blend-mode-selector')?.value || 'normal';
    
    // Get the second layer
    const secondLayer = document.getElementById('second-card-layer');
    if (!secondLayer) {
        console.log('No second layer found, cannot apply mask and blend');
        return;
    }
    
    console.log(`Applying mask: ${maskUrl}, blend mode: ${blendMode}`);
    
    // Apply mask styles
    if (maskUrl && maskUrl !== '') {
        // Check if this is a custom mask in our mask dictionary
        const maskSource = window.customMasks && window.customMasks[maskUrl] 
            ? window.customMasks[maskUrl] 
            : maskUrl;
            
        // Apply mask
        const finalMaskUrl = maskSource.startsWith('data:') 
            ? `url('${maskSource}')` 
            : maskUrl.startsWith('img/') 
                ? `url('/${maskUrl}')` 
                : `url('${maskUrl}')`;
                
        // Reset previous styles
        secondLayer.style.clipPath = 'none';
        secondLayer.style.webkitClipPath = 'none';
        
        // Apply mask
        secondLayer.style.maskImage = finalMaskUrl;
        secondLayer.style.webkitMaskImage = finalMaskUrl;
        secondLayer.style.maskSize = 'contain';
        secondLayer.style.webkitMaskSize = 'contain';
        secondLayer.style.maskRepeat = 'no-repeat';
        secondLayer.style.webkitMaskRepeat = 'no-repeat';
        secondLayer.style.maskPosition = 'center';
        secondLayer.style.webkitMaskPosition = 'center';
    } else {
        // Reset mask styles
        secondLayer.style.maskImage = 'none';
        secondLayer.style.webkitMaskImage = 'none';
        
        // Apply default diagonal split using clip-path
        secondLayer.style.clipPath = 'polygon(0 0, 100% 0, 0 100%)';
        secondLayer.style.webkitClipPath = 'polygon(0 0, 100% 0, 0 100%)';
    }
    
    // Apply blend mode
    secondLayer.style.mixBlendMode = blendMode;
}

/**
 * Enhance the card download process to properly handle masks and blend modes
 */
function enhanceCardDownload() {
    // Look for the original card-download.js functionality
    if (typeof window.downloadCardWithCanvas === 'function') {
        // Store the original function
        const originalDownloadCardWithCanvas = window.downloadCardWithCanvas;
        
        // Override with our enhanced version
        window.downloadCardWithCanvas = async function() {
            // Make sure the second layer has correct mask and blend applied
            applyCurrentMaskAndBlend();
            
            // Call the original download function
            await originalDownloadCardWithCanvas.apply(this, arguments);
        };
        
        console.log("Enhanced card download functionality");
    } else {
        console.warn("Original downloadCardWithCanvas function not found, cannot enhance");
    }
}

/**
 * Integrate with the dual-type-simple.js module
 */
function integrateDualTypeSimple() {
    if (!window.dualTypeSimple) {
        console.warn("dualTypeSimple not found, cannot integrate");
        return;
    }
    
    console.log("Integrating with dual-type-simple.js");
    
    // Store original functions
    const originalUpdateSecondLayer = window.dualTypeSimple.updateSecondLayer;
    const originalUpdateMaskOnLayer = window.dualTypeSimple.updateMaskOnLayer;
    
    // Override updateSecondLayer to use our enhanced version
    window.dualTypeSimple.updateSecondLayer = function() {
        // First call the original function
        if (typeof originalUpdateSecondLayer === 'function') {
            originalUpdateSecondLayer.call(window.dualTypeSimple);
        }
        
        // Then apply our enhanced mask and blend
        applyCurrentMaskAndBlend();
    };
    
    // Override updateMaskOnLayer to use our version
    window.dualTypeSimple.updateMaskOnLayer = function() {
        applyCurrentMaskAndBlend();
    };
    
    // Override getCurrentMaskUrl
    window.dualTypeSimple.getCurrentMaskUrl = function() {
        return document.getElementById('mask-selector')?.value || '';
    };
    
    console.log("Successfully integrated with dual-type-simple.js");
}

// Initialize the enhanced dual type system when the document is ready
document.addEventListener('DOMContentLoaded', initEnhancedDualTypeSystem);
// dual-type-integration.js
// Main integration script to connect all enhanced dual type components

/**
 * Initialize the enhanced dual type system
 */
function initEnhancedDualTypeSystem() {
    console.log("Initializing Enhanced Dual Type System");
    
    // Load the CSS enhancements
    loadEnhancedCSS();
    
    // Set up DOM enhancements
    enhanceDualTypeDOM();
    
    // Initial mask test - load default masks if needed
    preloadMaskImages();
    
    // Set up event listeners
    setupEventListeners();
    
    // Override download and export functionality
    enhanceCardDownload();
    
    // Integrate with dual-type-simple.js
    integrateDualTypeSimple();
}

/**
 * Load the enhanced CSS for dual type functionality
 */
function loadEnhancedCSS() {
    const styleId = 'dual-type-enhanced-css';
    
    // Check if already loaded
    if (document.getElementById(styleId)) return;
    
    // Create style element
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Enhanced Dual Type Styling */
        
        /* Mask and Blend Mode Selection Container */
        .mask-selection-container {
            margin: 15px auto;
            width: 90%;
            max-width: 378px;
            background-color: rgba(0, 0, 0, 0.2);
            padding: 12px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
        }

        .mask-selection-container:hover {
            background-color: rgba(0, 0, 0, 0.25);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        /* Label styling */
        .mask-selection-container label {
            display: block;
            margin-bottom: 8px;
            color: white;
            text-shadow: 1px 0 1px #1365b3, 0 1px 1px #1365b3;
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        /* Dropdown base styles */
        #mask-selector,
        #blend-mode-selector,
        #dual-card-set {
            width: 100%;
            padding: 8px 12px;
            background-color: white;
            color: #333; /* Dark text for readability */
            box-shadow: 0 0 15px var(--darkred) inset;
            border: 1px solid white;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12pt;
            height: 35px; /* Consistent height */
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            
            /* Custom dropdown arrow */
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
            background-repeat: no-repeat;
            background-position: right 10px center;
            background-size: 10px auto;
            padding-right: 30px; /* Make space for the arrow */
        }

        /* Dropdown focus/hover states */
        #mask-selector:focus,
        #blend-mode-selector:focus,
        #dual-card-set:focus {
            outline: 1px solid var(--yellow);
            border: 1px solid var(--yellow);
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.7), 0 0 15px var(--darkred) inset;
        }

        #mask-selector:hover,
        #blend-mode-selector:hover,
        #dual-card-set:hover {
            outline: 1px solid var(--yellow);
            border: 1px solid var(--yellow);
            box-shadow: none;
            background-color: white;
        }

        /* Option styles within dropdowns */
        option {
            background-color: white;
            color: #333;
            padding: 8px;
            font-family: monospace;
        }

        /* Card Second Layer styling */
        #second-card-layer {
            pointer-events: none; /* Allow clicks to pass through */
            transition: background-image 0.3s ease, mix-blend-mode 0.3s ease;
            z-index: 1 !important; /* Ensure this is below card content */
        }
    `;
    
    // Add to document
    document.head.appendChild(style);
    console.log("Added enhanced dual type CSS");
}

/**
 * Enhance the dual type DOM with additional elements
 */
/**
 * Enhances the dual type DOM with additional UI elements
 */
function enhanceDualTypeDOM() {
    // Find the mask selector
    const maskSelector = document.getElementById('mask-selector');
    if (!maskSelector) {
        console.warn("Mask selector not found, cannot enhance DOM");
        return;
    }
    
    // Find or create mask container
    let maskContainer = maskSelector.closest('.mask-selection-container');
    if (!maskContainer) {
        console.warn("Mask container not found, creating one");
        
        // Get the parent container
        const parentContainer = maskSelector.parentNode;
        
        // Create mask container
        maskContainer = document.createElement('div');
        maskContainer.className = 'mask-selection-container';
        
        // Add label
        const label = document.createElement('label');
        label.setAttribute('for', 'mask-selector');
        label.textContent = 'Type Mask:';
        
        // Create new container structure
        maskContainer.appendChild(label);
        
        // Replace the selector
        parentContainer.replaceChild(maskContainer, maskSelector);
        maskContainer.appendChild(maskSelector);
    }
    
    // Create and add the blend mode selector if it doesn't exist
    if (!document.getElementById('blend-mode-selector')) {
        const blendModeContainer = document.createElement('div');
        blendModeContainer.className = 'mask-selection-container';
        
        const blendModeLabel = document.createElement('label');
        blendModeLabel.setAttribute('for', 'blend-mode-selector');
        blendModeLabel.textContent = 'Blend Mode:';
        
        const blendModeSelect = document.createElement('select');
        blendModeSelect.id = 'blend-mode-selector';
        blendModeSelect.name = 'blend-mode-selector';
        
        // Add blend mode options
        const blendModes = [
            { value: 'normal', label: 'Normal' },
            { value: 'multiply', label: 'Multiply' },
            { value: 'screen', label: 'Screen' },
            { value: 'overlay', label: 'Overlay' },
            { value: 'darken', label: 'Darken' },
            { value: 'lighten', label: 'Lighten' },
            { value: 'color-dodge', label: 'Color Dodge' },
            { value: 'color-burn', label: 'Color Burn' },
            { value: 'hard-light', label: 'Hard Light' },
            { value: 'soft-light', label: 'Soft Light' },
            { value: 'difference', label: 'Difference' },
            { value: 'exclusion', label: 'Exclusion' }
        ];
        
        blendModes.forEach(mode => {
            const option = document.createElement('option');
            option.value = mode.value;
            option.textContent = mode.label;
            blendModeSelect.appendChild(option);
        });
        
        blendModeContainer.appendChild(blendModeLabel);
        blendModeContainer.appendChild(blendModeSelect);
        
        // Add after mask container
        maskContainer.parentNode.insertBefore(blendModeContainer, maskContainer.nextSibling);
    }
    
    // Check if mask selector needs populating
    if (maskSelector.children.length <= 1) {
        populateMaskSelector(maskSelector);
    }
}