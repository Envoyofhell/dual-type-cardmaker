// mask-previews.js - Creates visual previews for mask and blend mode options

/**
 * Available mask options with preview data
 */
const MASK_OPTIONS = [
    { 
        value: '', 
        label: 'Default Split (Diagonal)', 
        type: 'clip-path',
        previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#ff0000;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#ff0000;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#0000ff;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#0000ff;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#grad2)" />
            <path d="M0,0 L100,0 L0,100 Z" fill="url(#grad1)" />
        </svg>`
    },
    { 
        value: 'img/mask.png', 
        label: 'Standard Mask', 
        type: 'mask',
        previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <defs>
                <linearGradient id="redBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#ff0000;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#0000ff;stop-opacity:1" />
                </linearGradient>
                <radialGradient id="fadeOut" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="70%" style="stop-color:#000000;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#000000;stop-opacity:0" />
                </radialGradient>
                <mask id="circleMask">
                    <rect width="100" height="100" fill="white" />
                    <circle cx="50" cy="50" r="40" fill="url(#fadeOut)" />
                </mask>
            </defs>
            <rect width="100" height="100" fill="#0000ff" />
            <rect width="100" height="100" fill="#ff0000" mask="url(#circleMask)" />
        </svg>`
    },
    { 
        value: 'img/masks/horizontal-split.png', 
        label: 'Horizontal Split', 
        type: 'mask',
        previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="50" fill="#ff0000" />
            <rect y="50" width="100" height="50" fill="#0000ff" />
        </svg>`
    },
    { 
        value: 'img/masks/vertical-split.png', 
        label: 'Vertical Split', 
        type: 'mask',
        previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="50" height="100" fill="#ff0000" />
            <rect x="50" width="50" height="100" fill="#0000ff" />
        </svg>`
    },
    { 
        value: 'img/masks/gradient-fade.png', 
        label: 'Gradient Fade', 
        type: 'mask',
        previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <defs>
                <linearGradient id="fade" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#ff0000;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#0000ff;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="100" height="100" fill="url(#fade)" />
        </svg>`
    },
    { 
        value: 'img/masks/circle-center.png', 
        label: 'Circle Center', 
        type: 'mask',
        previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#0000ff" />
            <circle cx="50" cy="50" r="40" fill="#ff0000" />
        </svg>`
    },
    { 
        value: 'img/masks/zigzag.png', 
        label: 'Zigzag Pattern', 
        type: 'mask',
        previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#0000ff" />
            <path d="M0,60 L20,40 L40,60 L60,40 L80,60 L100,40 L100,100 L0,100 Z" fill="#ff0000" />
        </svg>`
    },
    { 
        value: 'img/masks/dots.png', 
        label: 'Dotted Pattern', 
        type: 'mask',
        previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#0000ff" />
            <circle cx="20" cy="20" r="10" fill="#ff0000" />
            <circle cx="60" cy="20" r="10" fill="#ff0000" />
            <circle cx="20" cy="60" r="10" fill="#ff0000" />
            <circle cx="60" cy="60" r="10" fill="#ff0000" />
        </svg>`
    }
];

/**
 * Blend mode options with preview data
 */
const BLEND_MODES = [
    { 
        value: 'normal', 
        label: 'Normal',
        previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#0000ff" />
            <rect x="30" y="30" width="40" height="40" fill="#ff0000" />
        </svg>`
    },
    { 
        value: 'multiply', 
        label: 'Multiply',
        previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#0000ff" />
            <rect x="30" y="30" width="40" height="40" fill="#ff0000" style="mix-blend-mode: multiply" />
        </svg>`
    },
    { 
        value: 'screen', 
        label: 'Screen',
        previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#0000ff" />
            <rect x="30" y="30" width="40" height="40" fill="#ff0000" style="mix-blend-mode: screen" />
        </svg>`
    },
    { 
        value: 'overlay', 
        label: 'Overlay',
        previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#0000ff" />
            <rect x="30" y="30" width="40" height="40" fill="#ff0000" style="mix-blend-mode: overlay" />
        </svg>`
    },
    { 
        value: 'darken', 
        label: 'Darken',
        previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#0000ff" />
            <rect x="30" y="30" width="40" height="40" fill="#ff0000" style="mix-blend-mode: darken" />
        </svg>`
    },
    { 
        value: 'lighten', 
        label: 'Lighten',
        previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#0000ff" />
            <rect x="30" y="30" width="40" height="40" fill="#ff0000" style="mix-blend-mode: lighten" />
        </svg>`
    }
];

/**
 * Initialize the visual previews for masks and blend modes
 */
function initMaskPreviews() {
    console.log("Initializing mask and blend mode previews");
    
    // Create preview containers
    createMaskPreviewGrid();
    createBlendModePreviewGrid();
}

/**
 * Create the preview grid for mask options
 */
function createMaskPreviewGrid() {
    const maskSelector = document.getElementById('mask-selector');
    if (!maskSelector) return;
    
    const container = maskSelector.closest('.mask-selection-container');
    if (!container) return;
    
    // Create preview container
    const previewContainer = document.createElement('div');
    previewContainer.className = 'dual-type-preview';
    previewContainer.innerHTML = '<h3>Mask Previews</h3>';
    
    // Create preview grid
    const previewGrid = document.createElement('div');
    previewGrid.className = 'preview-grid';
    
    // Add mask preview items
    MASK_OPTIONS.forEach(mask => {
        const previewItem = createPreviewItem(mask, 'mask', maskSelector);
        previewGrid.appendChild(previewItem);
    });
    
    // Add grid to container
    previewContainer.appendChild(previewGrid);
    
    // Add container after the selector
    container.appendChild(previewContainer);
}

/**
 * Create the preview grid for blend mode options
 */
function createBlendModePreviewGrid() {
    const blendModeSelector = document.getElementById('blend-mode-selector');
    if (!blendModeSelector) return;
    
    const container = blendModeSelector.closest('.mask-selection-container');
    if (!container) return;
    
    // Create preview container
    const previewContainer = document.createElement('div');
    previewContainer.className = 'dual-type-preview';
    previewContainer.innerHTML = '<h3>Blend Mode Previews</h3>';
    
    // Create preview grid
    const previewGrid = document.createElement('div');
    previewGrid.className = 'preview-grid';
    
    // Add blend mode preview items
    BLEND_MODES.forEach(mode => {
        const previewItem = createPreviewItem(mode, 'blend', blendModeSelector);
        previewGrid.appendChild(previewItem);
    });
    
    // Add grid to container
    previewContainer.appendChild(previewGrid);
    
    // Add container after the selector
    container.appendChild(previewContainer);
}

/**
 * Create a preview item for a mask or blend mode
 * 
 * @param {Object} item - The mask or blend mode option
 * @param {string} type - 'mask' or 'blend'
 * @param {HTMLElement} selector - The related dropdown selector
 * @returns {HTMLElement} - The created preview item
 */
function createPreviewItem(item, type, selector) {
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item tooltip';
    previewItem.dataset.value = item.value;
    
    // Create SVG preview
    if (item.previewSvg) {
        // Convert SVG string to data URL
        const svgBlob = new Blob([item.previewSvg], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        const img = document.createElement('img');
        img.src = svgUrl;
        img.alt = item.label;
        previewItem.appendChild(img);
    }
    
    // Add name
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = item.label;
    previewItem.appendChild(name);
    
    // Add tooltip
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltiptext';
    tooltip.textContent = item.label;
    previewItem.appendChild(tooltip);
    
    // Click handler to select this option
    previewItem.addEventListener('click', () => {
        selector.value = item.value;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        selector.dispatchEvent(event);
        
        // Update active state
        updateActivePreviewItem(type, item.value);
    });
    
    return previewItem;
}

/**
 * Update which preview item is marked as active
 * 
 * @param {string} type - 'mask' or 'blend'
 * @param {string} value - The value of the selected option
 */
function updateActivePreviewItem(type, value) {
    const container = document.querySelector(`.dual-type-preview:has(h3:contains("${type === 'mask' ? 'Mask' : 'Blend Mode'} Previews"))`);
    if (!container) return;
    
    // Remove active class from all items
    const items = container.querySelectorAll('.preview-item');
    items.forEach(item => item.classList.remove('active'));
    
    // Add active class to selected item
    const activeItem = container.querySelector(`.preview-item[data-value="${value}"]`);
    if (activeItem) activeItem.classList.add('active');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initMaskPreviews);

// Listen for mask and blend mode changes
document.addEventListener('change', (event) => {
    if (event.target.id === 'mask-selector') {
        updateActivePreviewItem('mask', event.target.value);
    } else if (event.target.id === 'blend-mode-selector') {
        updateActivePreviewItem('blend', event.target.value);
    }
});

// Export for use in other modules
export {
    MASK_OPTIONS,
    BLEND_MODES
};