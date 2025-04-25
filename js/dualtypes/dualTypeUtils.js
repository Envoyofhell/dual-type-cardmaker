/**
 * dualTypeUtils.js - Enhanced masking and blending utilities for dual-type Pokémon cards.
 * This utility extends the existing masking functionality with improved blend modes
 * and a more robust approach to applying masks and backgrounds.
 */

// Store available mask options
const MASK_OPTIONS = [
    { value: '', label: 'Default Split (Diagonal)', type: 'clip-path' },
    { value: 'img/mask.png', label: 'Standard Mask', type: 'mask' },
    { value: 'img/masks/horizontal-split.png', label: 'Horizontal Split', type: 'mask' },
    { value: 'img/masks/vertical-split.png', label: 'Vertical Split', type: 'mask' },
    { value: 'img/masks/gradient-fade.png', label: 'Gradient Fade', type: 'mask' },
    { value: 'img/masks/circle-center.png', label: 'Circle Center', type: 'mask' },
    { value: 'img/masks/mask-angle.png', label: 'New Diagonal Pattern' },
    { value: 'img/masks/mask-star.png', label: 'Star Pattern' }
];

// Store blend mode options
const BLEND_MODES = [
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

/**
 * Gets the background style (image URL or CSS class) for a given card type/stage/set.
 * Assumes window.SETS_CONFIG and window.CARD_SETS are loaded.
 * 
 * @param {string} setKey - The key of the card set.
 * @param {string} type - The Pokémon type.
 * @param {string} stage - The Pokémon stage.
 * @returns {{backgroundImage: string, className: string}} - Style properties.
 */
export const getCardBackgroundStyle = (setKey, type, stage) => {
    if (!window.SETS_CONFIG || !window.CARD_SETS) {
        console.warn("SETS_CONFIG or CARD_SETS not loaded in getCardBackgroundStyle");
        return { backgroundImage: '', className: `card-${type}-${stage}` };
    }
    const setConfig = window.SETS_CONFIG[setKey];
    const cardSetData = window.CARD_SETS[setKey];
    if (!setConfig || !cardSetData) {
        console.warn(`Config/data missing for set: ${setKey}. Falling back.`);
        return { backgroundImage: '', className: `card-${type}-${stage}` };
    }
    if (setConfig.cssClassBased) {
        return { backgroundImage: '', className: `card-${type}-${stage}` };
    }
    try {
        const typeData = cardSetData.types?.[type];
        const stageData = typeData?.[stage];
        const imagePath = stageData?.path;
        if (imagePath) {
            const safePath = imagePath.replace(/'/g, "%27").replace(/"/g, "%22");
            const finalPath = safePath.startsWith('img/') ? `/${safePath}` : safePath;
            return { backgroundImage: `url('${finalPath}')`, className: '' };
        } else {
            console.warn(`Path NOT found: Set='${setKey}', Type='${type}', Stage='${stage}'. Falling back.`);
            return { backgroundImage: '', className: `card-${type}-${stage}` };
        }
    } catch (e) {
        console.error(`Error accessing CARD_SETS for ${setKey}/${type}/${stage}:`, e);
        return { backgroundImage: '', className: `card-${type}-${stage}` };
    }
};

/**
 * Populates the mask selector dropdown with available options.
 * 
 * @param {HTMLElement} maskSelector - The mask selector dropdown element.
 */
export const populateMaskSelector = (maskSelector) => {
    if (!maskSelector) return;
    
    // Clear existing options
    maskSelector.innerHTML = '';
    
    // Add mask options
    MASK_OPTIONS.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        optionElement.setAttribute('data-type', option.type);
        maskSelector.appendChild(optionElement);
    });
};

/**
 * Creates the blend mode selector dropdown next to the mask selector.
 * 
 * @returns {HTMLElement} - The created blend mode selector.
 */
export const createBlendModeSelector = () => {
    const container = document.createElement('div');
    container.className = 'mask-selection-container';
    
    const label = document.createElement('label');
    label.setAttribute('for', 'blend-mode-selector');
    label.textContent = 'Blend Mode:';
    
    const select = document.createElement('select');
    select.id = 'blend-mode-selector';
    select.name = 'blend-mode-selector';
    
    // Add blend mode options
    BLEND_MODES.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        select.appendChild(optionElement);
    });
    
    container.appendChild(label);
    container.appendChild(select);
    
    return container;
};

/**
 * Applies mask and blend mode to a layer element.
 * 
 * @param {HTMLElement} layerElement - The DOM element for the second layer.
 * @param {string} maskUrl - The URL of the mask image, or empty string for default split.
 * @param {string} blendMode - The CSS mix-blend-mode to apply.
 */
export const applyMaskAndBlendToLayer = (layerElement, maskUrl, blendMode = 'normal') => {
    if (!layerElement) return;

    // Reset previous mask/clip styles
    layerElement.style.maskImage = 'none';
    layerElement.style.webkitMaskImage = 'none';
    layerElement.style.clipPath = 'none';
    layerElement.style.webkitClipPath = 'none';
    layerElement.style.maskSize = 'initial';
    layerElement.style.webkitMaskSize = 'initial';
    layerElement.style.maskRepeat = 'initial';
    layerElement.style.webkitMaskRepeat = 'initial';
    layerElement.style.maskPosition = 'initial';
    layerElement.style.webkitMaskPosition = 'initial';
    
    // Apply blend mode
    layerElement.style.mixBlendMode = blendMode;
    
    if (maskUrl && maskUrl !== "") {
        // Apply mask-image properties if a URL is provided
        console.log(`Applying mask-image: ${maskUrl} to #${layerElement.id}`);
        const finalMaskUrl = maskUrl.startsWith('img/') ? `url('/${maskUrl}')` : `url('${maskUrl}')`;
        layerElement.style.maskImage = finalMaskUrl;
        layerElement.style.webkitMaskImage = finalMaskUrl;
        // Common mask properties
        layerElement.style.maskSize = 'contain';
        layerElement.style.webkitMaskSize = 'contain';
        layerElement.style.maskRepeat = 'no-repeat';
        layerElement.style.webkitMaskRepeat = 'no-repeat';
        layerElement.style.maskPosition = 'center';
        layerElement.style.webkitMaskPosition = 'center';
        // Set mask mode to alpha (works with luminance of image)
        layerElement.style.maskMode = 'alpha';
        layerElement.style.webkitMaskMode = 'alpha';
    } else {
        // Apply default diagonal split using clip-path if no mask URL
        console.log("Applying default clip-path split to #second-card-layer");
        layerElement.style.clipPath = 'polygon(0 0, 100% 0, 0 100%)';
        layerElement.style.webkitClipPath = 'polygon(0 0, 100% 0, 0 100%)';
    }
};

/**
 * Adds or updates the second type layer (#second-card-layer) on the card preview
 * and applies the CSS mask and blend mode.
 *
 * @param {HTMLElement} cardElement - The main card DOM element (#card).
 * @param {string} secondaryType - The selected secondary type.
 * @param {string} stage - The current card stage.
 * @param {string} dualSetKey - The key for the selected dual type set.
 * @param {string} maskUrl - The URL for the selected mask image/pattern.
 * @param {string} blendMode - The selected CSS mix-blend-mode.
 */
export const addOrUpdateDualLayerWithMaskAndBlend = (
    cardElement, 
    secondaryType, 
    stage, 
    dualSetKey, 
    maskUrl, 
    blendMode = 'normal'
) => {
    if (!cardElement || !secondaryType || !stage || !dualSetKey) {
        console.warn("Missing parameters for addOrUpdateDualLayerWithMaskAndBlend");
        removeDualLayer(cardElement); // Remove if parameters are invalid
        return;
    }

    let layer = cardElement.querySelector('#second-card-layer');

    // Create layer if it doesn't exist
    if (!layer) {
        layer = document.createElement('div');
        layer.id = 'second-card-layer';
        // Base styles (position, size, z-index) applied via App.css
        layer.style.position = 'absolute';
        layer.style.top = '0';
        layer.style.left = '0';
        layer.style.width = '100%';
        layer.style.height = '100%';
        layer.style.zIndex = '1'; // Above base card, below content
        layer.style.pointerEvents = 'none';
        cardElement.appendChild(layer);
        console.log("Created #second-card-layer");
    }

    // Get background style for the secondary type and dual set
    const style = getCardBackgroundStyle(dualSetKey, secondaryType, stage);

    // Apply background
    if (style.className) {
        layer.className = '';
        layer.classList.add(style.className);
        layer.style.backgroundImage = '';
        console.log(`Applied class ${style.className} to second layer`);
    } else if (style.backgroundImage) {
        layer.className = '';
        layer.style.backgroundImage = style.backgroundImage;
        layer.style.backgroundSize = 'contain';
        layer.style.backgroundRepeat = 'no-repeat';
        layer.style.backgroundPosition = 'center';
        console.log(`Applied background image ${style.backgroundImage} to second layer`);
    } else {
        layer.className = '';
        layer.style.backgroundImage = 'none';
        console.warn("Could not determine background for second layer.");
    }

    // Apply the selected mask and blend mode
    applyMaskAndBlendToLayer(layer, maskUrl, blendMode);
};

/**
 * Removes the second type layer (#second-card-layer).
 *
 * @param {HTMLElement} cardElement - The main card DOM element (#card).
 */
export const removeDualLayer = (cardElement) => {
    if (!cardElement) return;
    const layer = cardElement.querySelector('#second-card-layer');
    if (layer) {
        layer.remove();
        console.log("Removed #second-card-layer");
    }
};

/**
 * Initializes the dual type controls by updating the mask selector
 * and creating the blend mode selector.
 */
export const initDualTypeControls = () => {
    // Populate mask selector with options
    const maskSelector = document.getElementById('mask-selector');
    if (maskSelector) {
        populateMaskSelector(maskSelector);
        
        // Add blend mode selector after mask selector
        const maskContainer = maskSelector.closest('.mask-selection-container');
        if (maskContainer) {
            const blendModeContainer = createBlendModeSelector();
            maskContainer.parentNode.insertBefore(blendModeContainer, maskContainer.nextSibling);
            
            // Add event listener to blend mode selector
            const blendModeSelector = document.getElementById('blend-mode-selector');
            if (blendModeSelector) {
                blendModeSelector.addEventListener('change', function() {
                    const secondLayer = document.getElementById('second-card-layer');
                    if (secondLayer) {
                        secondLayer.style.mixBlendMode = this.value;
                        console.log(`Applied blend mode: ${this.value} to second layer`);
                    }
                });
            }
        }
    }
    
    // Update dual-type-simple.js integration
    updateDualTypeSimpleIntegration();
    
    // Make sure we have some default mask images
    createDefaultMaskImages();
};

/**
 * Updates the dual-type-simple.js integration by overriding or extending
 * some of its functions to use our enhanced mask and blend utilities.
 */
export const updateDualTypeSimpleIntegration = () => {
    // Only proceed if dualTypeSimple exists
    if (!window.dualTypeSimple) {
        console.warn("dualTypeSimple not found, cannot integrate enhanced utilities");
        return;
    }
    
    // Store the original updateSecondLayer function
    const originalUpdateSecondLayer = window.dualTypeSimple.updateSecondLayer;
    
    // Override updateSecondLayer to use our enhanced version
    window.dualTypeSimple.updateSecondLayer = function() {
        // If the original function exists, call it to handle all the basic logic
        if (typeof originalUpdateSecondLayer === 'function') {
            originalUpdateSecondLayer.call(window.dualTypeSimple);
        }
        
        // Now enhance the layer with our blend mode
        const secondLayer = document.getElementById('second-card-layer');
        const blendModeSelector = document.getElementById('blend-mode-selector');
        
        if (secondLayer && blendModeSelector) {
            secondLayer.style.mixBlendMode = blendModeSelector.value;
            console.log(`Enhanced: Applied blend mode ${blendModeSelector.value} to second layer`);
        }
    };
    
    // Also override the updateMaskOnLayer function to use our enhanced version
    window.dualTypeSimple.updateMaskOnLayer = function() {
        const secondLayer = document.getElementById('second-card-layer');
        const maskSelector = document.getElementById('mask-selector');
        const blendModeSelector = document.getElementById('blend-mode-selector');
        
        if (secondLayer && maskSelector) {
            const maskUrl = maskSelector.value;
            const blendMode = blendModeSelector ? blendModeSelector.value : 'normal';
            applyMaskAndBlendToLayer(secondLayer, maskUrl, blendMode);
        }
    };
    
    console.log("Successfully integrated enhanced dual type utilities with dualTypeSimple");
};

/**
 * Creates default mask image elements in the DOM for use with the mask selector.
 * This ensures the mask images exist even if not included in the project files.
 */
export const createDefaultMaskImages = () => {
    // Create masks directory if it doesn't exist
    const masksDir = 'img/masks';
    
    // List of default masks to create
    const defaultMasks = [
        {
            name: 'horizontal-split.png',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <rect width="512" height="256" fill="black"/>
                <rect y="256" width="512" height="256" fill="white"/>
            </svg>`
        },
        {
            name: 'vertical-split.png',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <rect width="256" height="512" fill="black"/>
                <rect x="256" width="256" height="512" fill="white"/>
            </svg>`
        },
        {
            name: 'gradient-fade.png',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="black"/>
                        <stop offset="100%" stop-color="white"/>
                    </linearGradient>
                </defs>
                <rect width="512" height="512" fill="url(#gradient)"/>
            </svg>`
        },
        {
            name: 'circle-center.png',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <circle cx="256" cy="256" r="256" fill="black"/>
            </svg>`
        },
        {
            name: 'zigzag.png',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <path d="M0,0 L512,0 L512,512 L0,512 Z" fill="black"/>
                <path d="M0,256 L64,192 L128,256 L192,192 L256,256 L320,192 L384,256 L448,192 L512,256 L512,512 L0,512 Z" fill="white"/>
            </svg>`
        },
        {
            name: 'dots.png',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                <rect width="512" height="512" fill="black"/>
                <circle cx="64" cy="64" r="32" fill="white"/>
                <circle cx="192" cy="64" r="32" fill="white"/>
                <circle cx="320" cy="64" r="32" fill="white"/>
                <circle cx="448" cy="64" r="32" fill="white"/>
                <circle cx="128" cy="128" r="32" fill="white"/>
                <circle cx="256" cy="128" r="32" fill="white"/>
                <circle cx="384" cy="128" r="32" fill="white"/>
                <circle cx="64" cy="192" r="32" fill="white"/>
                <circle cx="192" cy="192" r="32" fill="white"/>
                <circle cx="320" cy="192" r="32" fill="white"/>
                <circle cx="448" cy="192" r="32" fill="white"/>
                <circle cx="128" cy="256" r="32" fill="white"/>
                <circle cx="256" cy="256" r="32" fill="white"/>
                <circle cx="384" cy="256" r="32" fill="white"/>
                <circle cx="64" cy="320" r="32" fill="white"/>
                <circle cx="192" cy="320" r="32" fill="white"/>
                <circle cx="320" cy="320" r="32" fill="white"/>
                <circle cx="448" cy="320" r="32" fill="white"/>
                <circle cx="128" cy="384" r="32" fill="white"/>
                <circle cx="256" cy="384" r="32" fill="white"/>
                <circle cx="384" cy="384" r="32" fill="white"/>
                <circle cx="64" cy="448" r="32" fill="white"/>
                <circle cx="192" cy="448" r="32" fill="white"/>
                <circle cx="320" cy="448" r="32" fill="white"/>
                <circle cx="448" cy="448" r="32" fill="white"/>
            </svg>`
        }
    ];
    
    // Create mask SVGs as Data URLs for use in mask selector
    defaultMasks.forEach(mask => {
        // Create a Data URL from the SVG
        const dataUrl = `data:image/svg+xml;base64,${btoa(mask.svg)}`;
        
        // Create an image in memory with the SVG
        const img = new Image();
        img.src = dataUrl;
        
        // Store the mask in the window object for reference
        if (!window.maskImages) {
            window.maskImages = {};
        }
        window.maskImages[`${masksDir}/${mask.name}`] = dataUrl;
        
        console.log(`Created default mask: ${masksDir}/${mask.name}`);
    });
};

// Initialize when loaded
document.addEventListener('DOMContentLoaded', initDualTypeControls);