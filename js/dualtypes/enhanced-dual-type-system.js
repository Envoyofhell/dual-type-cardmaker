/**
 * enhanced-dual-type-system.js
 * 
 * A comprehensive enhancement for the Pokémon Card Maker's dual type functionality.
 * This script improves the masking, blending, and visual presentation of dual type cards.
 * 
 * Features:
 * - Enhanced mask system with multiple mask options
 * - CSS mix-blend-mode support for better type blending
 * - Improved UI with readable dropdowns
 * - Visual preview system for masks and blend modes
 * - Built-in mask image generator for consistent results
 * - Seamless integration with the card download system
 */

(function() {
    'use strict';
    
    // --- Configuration Constants ---
    
    // Available mask options
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
    
    // Available blend modes
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
    
    // Default SVG masks for built-in options
    const DEFAULT_MASKS = [
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
    
    // Reference to current mask and blend mode settings
    let currentMaskUrl = 'img/mask.png';
    let currentBlendMode = 'normal';
    
    // Reference to key DOM elements
    let maskSelector = null;
    let blendModeSelector = null;
    
    // --- Initialization ---
    
    /**
     * Initialize the enhanced dual type system
     */
    function init() {
        console.log("Initializing Enhanced Dual Type System");
        
        // Load CSS and UI enhancements
        injectCSS();
        enhanceDOM();
        
        // Create mask images and initialize selectors
        createMaskImages();
        initSelectors();
        
        // Set up event listeners and integrate with existing code
        setupEventListeners();
        enhanceCardDownload();
        integrateDualTypeSimple();
        
        console.log("Enhanced Dual Type System initialized");
    }
    
    /**
     * Inject CSS needed for the enhanced dual type system
     */
    function injectCSS() {
        const styleId = 'enhanced-dual-type-css';
        
        // Check if styles are already injected
        if (document.getElementById(styleId)) {
            return;
        }
        
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
            
            /* Visual preview section for masks and blend modes */
            .dual-type-preview {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-top: 15px;
                padding: 10px;
                background-color: rgba(0, 0, 0, 0.1);
                border-radius: 8px;
            }

            .dual-type-preview h3 {
                color: white;
                margin: 0 0 10px 0;
                font-size: 14px;
                text-shadow: 1px 0 1px #143b08, 0 1px 1px #1365b3;
            }

            .preview-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 5px;
                width: 100%;
            }

            .preview-item {
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 5px;
                padding: 5px;
                cursor: pointer;
                text-align: center;
                transition: all 0.2s ease;
            }

            .preview-item:hover {
                background-color: rgba(255, 255, 255, 0.2);
            }

            .preview-item.active {
                outline: 2px solid var(--yellow);
                background-color: rgba(255, 255, 255, 0.3);
            }

            .preview-item img {
                width: 100%;
                height: auto;
                border-radius: 3px;
            }

            .preview-item .name {
                font-size: 10px;
                color: white;
                margin-top: 4px;
                text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            /* Help tooltip */
            .help-tooltip {
                display: inline-block;
                width: 16px;
                height: 16px;
                background-color: rgba(19, 101, 179, 0.7);
                color: white;
                border-radius: 50%;
                text-align: center;
                line-height: 16px;
                font-size: 12px;
                margin-left: 5px;
                cursor: help;
                position: relative;
            }
            
            .help-tooltip .tooltip-text {
                visibility: hidden;
                width: 200px;
                background-color: rgba(0, 0, 0, 0.8);
                color: #fff;
                text-align: center;
                border-radius: 6px;
                padding: 8px;
                position: absolute;
                z-index: 1000;
                bottom: 125%;
                left: 50%;
                margin-left: -100px;
                opacity: 0;
                transition: opacity 0.3s;
                font-size: 12px;
                pointer-events: none;
            }
            
            .help-tooltip:hover .tooltip-text {
                visibility: visible;
                opacity: 1;
            }
        `;
        
        // Add to document
        document.head.appendChild(style);
        console.log("Enhanced dual type CSS injected");
    }
    
    /**
     * Enhance the DOM with additional UI elements
     */
    function enhanceDOM() {
        // Find or create mask container and selectors
        createMaskSelectors();
        
        // Create visual previews
        createVisualPreviews();
    }
    
    /**
     * Create or improve the mask and blend mode selectors
     */
    function createMaskSelectors() {
        // Find the mask selector
        const existingMaskSelector = document.getElementById('mask-selector');
        
        if (existingMaskSelector) {
            // Find or create container for existing selector
            let maskContainer = existingMaskSelector.closest('.mask-selection-container');
            
            if (!maskContainer) {
                // Create a proper container for the existing selector
                maskContainer = document.createElement('div');
                maskContainer.className = 'mask-selection-container';
                
                // Add label
                const label = document.createElement('label');
                label.setAttribute('for', 'mask-selector');
                label.textContent = 'Type Mask:';
                
                // Add help tooltip
                const tooltip = document.createElement('span');
                tooltip.className = 'help-tooltip';
                tooltip.textContent = '?';
                
                const tooltipText = document.createElement('span');
                tooltipText.className = 'tooltip-text';
                tooltipText.textContent = 'Controls how the secondary type appears on your card. The mask determines which parts of the second type are visible.';
                
                tooltip.appendChild(tooltipText);
                label.appendChild(tooltip);
                
                // Wrap existing selector in container
                const parent = existingMaskSelector.parentNode;
                parent.replaceChild(maskContainer, existingMaskSelector);
                
                maskContainer.appendChild(label);
                maskContainer.appendChild(existingMaskSelector);
            }
            
            // Store reference to mask selector
            maskSelector = existingMaskSelector;
        } else {
            // Find the dual type container
            const dualTypeContainer = document.getElementById('dual-type-container');
            
            if (!dualTypeContainer) {
                console.warn("Dual type container not found, cannot create selectors");
                return;
            }
            
            // Create mask container
            const maskContainer = document.createElement('div');
            maskContainer.className = 'mask-selection-container';
            
            // Create mask label
            const maskLabel = document.createElement('label');
            maskLabel.setAttribute('for', 'mask-selector');
            maskLabel.textContent = 'Type Mask:';
            
            // Add help tooltip
            const maskTooltip = document.createElement('span');
            maskTooltip.className = 'help-tooltip';
            maskTooltip.textContent = '?';
            
            const maskTooltipText = document.createElement('span');
            maskTooltipText.className = 'tooltip-text';
            maskTooltipText.textContent = 'Controls how the secondary type appears on your card. The mask determines which parts of the second type are visible.';
            
            maskTooltip.appendChild(maskTooltipText);
            maskLabel.appendChild(maskTooltip);
            
            // Create mask selector
            const newMaskSelector = document.createElement('select');
            newMaskSelector.id = 'mask-selector';
            newMaskSelector.name = 'mask-selector';
            
            // Add to container
            maskContainer.appendChild(maskLabel);
            maskContainer.appendChild(newMaskSelector);
            
            // Add container to page
            dualTypeContainer.appendChild(maskContainer);
            
            // Store reference
            maskSelector = newMaskSelector;
        }
        
        // Create blend mode selector (always a new element)
        const blendContainer = document.createElement('div');
        blendContainer.className = 'mask-selection-container';
        
        // Create blend mode label
        const blendLabel = document.createElement('label');
        blendLabel.setAttribute('for', 'blend-mode-selector');
        blendLabel.textContent = 'Blend Mode:';
        
        // Add help tooltip
        const blendTooltip = document.createElement('span');
        blendTooltip.className = 'help-tooltip';
        blendTooltip.textContent = '?';
        
        const blendTooltipText = document.createElement('span');
        blendTooltipText.className = 'tooltip-text';
        blendTooltipText.textContent = 'Controls how the secondary type blends with the primary type. Different blend modes create different visual effects.';
        
        blendTooltip.appendChild(blendTooltipText);
        blendLabel.appendChild(blendTooltip);
        
        // Create blend mode selector
        const newBlendSelector = document.createElement('select');
        newBlendSelector.id = 'blend-mode-selector';
        newBlendSelector.name = 'blend-mode-selector';
        
        // Add to container
        blendContainer.appendChild(blendLabel);
        blendContainer.appendChild(newBlendSelector);
        
        // Add container after mask container
        const parent = maskSelector.closest('.mask-selection-container');
        if (parent && parent.parentNode) {
            parent.parentNode.insertBefore(blendContainer, parent.nextSibling);
        } else if (maskSelector.parentNode) {
            maskSelector.parentNode.appendChild(blendContainer);
        }
        
        // Store reference
        blendModeSelector = newBlendSelector;
    }
    
    /**
     * Create the visual preview components
     */
    function createVisualPreviews() {
        // Only create previews if both selectors exist
        if (!maskSelector || !blendModeSelector) {
            console.warn("Cannot create visual previews, selectors not found");
            return;
        }
        
        // Create mask preview container
        const maskPreviewContainer = document.createElement('div');
        maskPreviewContainer.className = 'dual-type-preview';
        maskPreviewContainer.innerHTML = '<h3>Mask Previews</h3>';
        
        // Create mask preview grid
        const maskPreviewGrid = document.createElement('div');
        maskPreviewGrid.className = 'preview-grid';
        
        // Add mask preview items
        MASK_OPTIONS.forEach(option => {
            const previewItem = createPreviewItem(option, 'mask');
            maskPreviewGrid.appendChild(previewItem);
        });
        
        // Add grid to container
        maskPreviewContainer.appendChild(maskPreviewGrid);
        
        // Add to page after mask selector
        const maskContainer = maskSelector.closest('.mask-selection-container');
        if (maskContainer) {
            maskContainer.appendChild(maskPreviewContainer);
        }
        
        // Create blend mode preview container
        const blendPreviewContainer = document.createElement('div');
        blendPreviewContainer.className = 'dual-type-preview';
        blendPreviewContainer.innerHTML = '<h3>Blend Mode Previews</h3>';
        
        // Create blend mode preview grid
        const blendPreviewGrid = document.createElement('div');
        blendPreviewGrid.className = 'preview-grid';
        
        // Add blend mode preview items
        BLEND_MODES.forEach(option => {
            const previewItem = createPreviewItem(option, 'blend');
            blendPreviewGrid.appendChild(previewItem);
        });
        
        // Add grid to container
        blendPreviewContainer.appendChild(blendPreviewGrid);
        
        // Add to page after blend mode selector
        const blendContainer = blendModeSelector.closest('.mask-selection-container');
        if (blendContainer) {
            blendContainer.appendChild(blendPreviewContainer);
        }
    }
    
    /**
     * Create a preview item for a mask or blend mode
     * 
     * @param {Object} option - The mask or blend mode option
     * @param {string} type - 'mask' or 'blend'
     * @returns {HTMLElement} The preview item
     */
    function createPreviewItem(option, type) {
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.setAttribute('data-value', option.value);
        
        // Create preview image element
        const img = document.createElement('img');
        
        // Set preview image based on type
        if (type === 'mask') {
            if (option.value === '') {
                // Default clip-path diagonal split
                img.src = 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                        <rect width="100" height="100" fill="#0000ff" />
                        <path d="M0,0 L100,0 L0,100 Z" fill="#ff0000" />
                    </svg>
                `);
            } else {
                // Other mask types
                const maskName = option.value.split('/').pop();
                img.src = 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="redBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style="stop-color:#ff0000;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#0000ff;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <rect width="100" height="100" fill="url(#redBlue)" />
                        <text x="50" y="50" font-size="12" text-anchor="middle" fill="white">${maskName}</text>
                    </svg>
                `);
            }
        } else if (type === 'blend') {
            // Blend mode preview
            img.src = 'data:image/svg+xml;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="#0000ff" />
                    <rect x="30" y="30" width="40" height="40" fill="#ff0000" style="mix-blend-mode: ${option.value}" />
                </svg>
            `);
        }
        
        item.appendChild(img);
        
        // Add name label
        const name = document.createElement('div');
        name.className = 'name';
        name.textContent = option.label;
        item.appendChild(name);
        
        // Add click handler
        item.addEventListener('click', () => {
            if (type === 'mask' && maskSelector) {
                maskSelector.value = option.value;
                currentMaskUrl = option.value;
                
                // Update active state
                updateActiveItem(type, option.value);
                
                // Apply the change
                applyCurrentMaskAndBlend();
                
                // Trigger change event for compatibility
                const event = new Event('change');
                maskSelector.dispatchEvent(event);
            } else if (type === 'blend' && blendModeSelector) {
                blendModeSelector.value = option.value;
                currentBlendMode = option.value;
                
                // Update active state
                updateActiveItem(type, option.value);
                
                // Apply the change
                applyCurrentMaskAndBlend();
                
                // Trigger change event for compatibility
                const event = new Event('change');
                blendModeSelector.dispatchEvent(event);
            }
        });
        
        return item;
    }
    
    /**
     * Update the active state of preview items
     * 
     * @param {string} type - 'mask' or 'blend'
     * @param {string} value - The value of the selected option
     */
    function updateActiveItem(type, value) {
        // Find the container for this type
        const container = document.querySelector(`.dual-type-preview h3`);
        if (!container) return;
        
        const parentContainer = container.closest('.dual-type-preview');
        if (!parentContainer) return;
        
        // Remove active class from all items
        const items = parentContainer.querySelectorAll('.preview-item');
        items.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected item
        const selectedItem = parentContainer.querySelector(`.preview-item[data-value="${value}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
    }
    
    /**
     * Initialize the mask and blend mode selectors
     */
    function initSelectors() {
        if (!maskSelector || !blendModeSelector) {
            console.warn("Selectors not found, cannot initialize");
            return;
        }
        
        // Clear existing options
        maskSelector.innerHTML = '';
        blendModeSelector.innerHTML = '';
        
        // Add mask options
        MASK_OPTIONS.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            maskSelector.appendChild(optionElement);
        });
        
        // Set default mask
        maskSelector.value = currentMaskUrl;
        
        // Add blend mode options
        BLEND_MODES.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            blendModeSelector.appendChild(optionElement);
        });
        
        // Set default blend mode
        blendModeSelector.value = currentBlendMode;
    }
    
    /**
     * Create mask images using SVG data URLs
     */
    function createMaskImages() {
        // Create global object to store masks
        if (!window.customMasks) {
            window.customMasks = {};
        }
        
        // Create masks using SVG data URLs
        DEFAULT_MASKS.forEach(mask => {
            // Create SVG blob
            const blob = new Blob([mask.svg], { type: 'image/svg+xml' });
            const dataUrl = URL.createObjectURL(blob);
            
            // Store in global object
            window.customMasks[mask.name] = dataUrl;
            
            // Preload the image
            const img = new Image();
            img.src = dataUrl;
            
            console.log(`Created mask: ${mask.name}`);
        });
    }
    
    /**
     * Scan for existing PNG masks in the img/masks directory
     * This detects any custom masks that may have been added manually
     */
    function scanForCustomMasks() {
        if (!maskSelector) return;
        
        // Add custom masks to dropdown when found
        const addCustomMaskOption = (path, fileName) => {
            // Check if option already exists
            let exists = false;
            for (let i = 0; i < maskSelector.options.length; i++) {
                if (maskSelector.options[i].value === path) {
                    exists = true;
                    break;
                }
            }
            
            if (!exists) {
                // Create new option
                const option = document.createElement('option');
                option.value = path;
                option.textContent = `Custom: ${fileName}`;
                maskSelector.appendChild(option);
                
                console.log(`Added custom mask: ${path}`);
                
                // Add to preview grid
                const previewContainer = document.querySelector('.dual-type-preview');
                if (previewContainer) {
                    const previewGrid = previewContainer.querySelector('.preview-grid');
                    if (previewGrid) {
                        const previewItem = createPreviewItem({
                            value: path,
                            label: `Custom: ${fileName}`
                        }, 'mask');
                        previewGrid.appendChild(previewItem);
                    }
                }
            }
        };
        
        // Listen for any mask file loads
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if (typeof url === 'string' && url.includes('/img/masks/') && url.match(/\.(png|jpg|svg)$/i)) {
                const fileName = url.split('/').pop();
                const fullPath = url.startsWith('/') ? url.substring(1) : url;
                addCustomMaskOption(fullPath, fileName);
            }
            originalXHROpen.apply(this, arguments);
        };
        
        // Also check for fetch requests
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            if (typeof url === 'string' && url.includes('/img/masks/') && url.match(/\.(png|jpg|svg)$/i)) {
                const fileName = url.split('/').pop();
                const fullPath = url.startsWith('/') ? url.substring(1) : url;
                addCustomMaskOption(fullPath, fileName);
            }
            return originalFetch.apply(this, arguments);
        };
        
        // If using jQuery, also monitor those requests
        if (window.jQuery) {
            const originalAjax = window.jQuery.ajax;
            window.jQuery.ajax = function(options) {
                if (options && options.url && 
                    typeof options.url === 'string' && 
                    options.url.includes('/img/masks/') && 
                    options.url.match(/\.(png|jpg|svg)$/i)) {
                    const fileName = options.url.split('/').pop();
                    const fullPath = options.url.startsWith('/') ? options.url.substring(1) : options.url;
                    addCustomMaskOption(fullPath, fileName);
                }
                return originalAjax.apply(this, arguments);
            };
        }
    }
    
    /**
     * Set up event listeners for the enhanced dual type system
     */
    function setupEventListeners() {
        // Listen for mask selector changes
        if (maskSelector) {
            maskSelector.addEventListener('change', function() {
                currentMaskUrl = this.value;
                applyCurrentMaskAndBlend();
            });
        }
        
        // Listen for blend mode selector changes
        if (blendModeSelector) {
            blendModeSelector.addEventListener('change', function() {
                currentBlendMode = this.value;
                applyCurrentMaskAndBlend();
            });
        }
        
        // Listen for dual type toggle changes
        const dualTypeToggle = document.getElementById('dual-type-toggle');
        if (dualTypeToggle) {
            // Preserve existing behavior but add our enhancements
            const originalChangeHandler = dualTypeToggle.onchange;
            
            dualTypeToggle.addEventListener('change', function() {
                // Call original handler if it exists
                if (typeof originalChangeHandler === 'function') {
                    originalChangeHandler.call(this);
                }
                
                // Update our UI based on toggle state
                const selectors = document.querySelectorAll('.mask-selection-container');
                selectors.forEach(selector => {
                    if (this.checked) {
                        selector.style.display = 'block';
                    } else {
                        selector.style.display = 'none';
                    }
                });
            });
            
            // Set initial state
            const selectors = document.querySelectorAll('.mask-selection-container');
            selectors.forEach(selector => {
                if (dualTypeToggle.checked) {
                    selector.style.display = 'block';
                } else {
                    selector.style.display = 'none';
                }
            });
        }
        
        // Listen for stage changes to update second layer when stage changes
        const stageSelect = document.getElementById('stage');
        if (stageSelect) {
            stageSelect.addEventListener('change', function() {
                // Delay slightly to ensure main card updates first
                setTimeout(() => {
                    // Only update if dual type is enabled
                    if (window.isDualType && window.secondType) {
                        // Update second layer
                        if (window.dualTypeSimple && typeof window.dualTypeSimple.updateSecondLayer === 'function') {
                            window.dualTypeSimple.updateSecondLayer();
                        }
                    }
                }, 100);
            });
        }
    }
    
    /**
     * Apply the current mask and blend mode to the second layer
     */
    function applyCurrentMaskAndBlend() {
        // Get the second layer
        const secondLayer = document.getElementById('second-card-layer');
        if (!secondLayer) {
            console.log("No second layer found, cannot apply mask and blend");
            return;
        }
        
        console.log(`Applying mask: ${currentMaskUrl}, blend mode: ${currentBlendMode}`);
        
        // Reset previous styles
        secondLayer.style.maskImage = 'none';
        secondLayer.style.webkitMaskImage = 'none';
        secondLayer.style.clipPath = 'none';
        secondLayer.style.webkitClipPath = 'none';
        secondLayer.style.maskSize = 'initial';
        secondLayer.style.webkitMaskSize = 'initial';
        secondLayer.style.maskRepeat = 'initial';
        secondLayer.style.webkitMaskRepeat = 'initial';
        secondLayer.style.maskPosition = 'initial';
        secondLayer.style.webkitMaskPosition = 'initial';
        
        // Apply mask
        if (currentMaskUrl && currentMaskUrl !== '') {
            // Check if this is a custom mask in our mask dictionary
            const maskSource = window.customMasks && window.customMasks[currentMaskUrl] 
                ? window.customMasks[currentMaskUrl] 
                : currentMaskUrl;
                
            // Create mask URL
            const finalMaskUrl = maskSource.startsWith('data:') 
                ? `url('${maskSource}')` 
                : maskSource.startsWith('img/') 
                    ? `url('/${maskSource}')` 
                    : `url('${maskSource}')`;
            
            // Apply mask image
            secondLayer.style.maskImage = finalMaskUrl;
            secondLayer.style.webkitMaskImage = finalMaskUrl;
            secondLayer.style.maskSize = 'contain';
            secondLayer.style.webkitMaskSize = 'contain';
            secondLayer.style.maskRepeat = 'no-repeat';
            secondLayer.style.webkitMaskRepeat = 'no-repeat';
            secondLayer.style.maskPosition = 'center';
            secondLayer.style.webkitMaskPosition = 'center';
            secondLayer.style.maskMode = 'alpha'; // Use alpha channel of mask
            secondLayer.style.webkitMaskMode = 'alpha';
        } else {
            // Apply default diagonal split using clip-path
            secondLayer.style.clipPath = 'polygon(0 0, 100% 0, 0 100%)';
            secondLayer.style.webkitClipPath = 'polygon(0 0, 100% 0, 0 100%)';
        }
        
        // Apply blend mode
        secondLayer.style.mixBlendMode = currentBlendMode || 'normal';
    }
    
    /**
     * Enhance the card download process to correctly handle masks and blend modes
     */
    function enhanceCardDownload() {
        // Check if downloadCardWithCanvas exists (from card-download.js)
        if (window.downloadCardWithCanvas && typeof window.downloadCardWithCanvas === 'function') {
            console.log("Enhancing card download functionality");
            
            // Store original function
            const originalDownloadCardWithCanvas = window.downloadCardWithCanvas;
            
            // Override with enhanced version
            window.downloadCardWithCanvas = async function() {
                // Ensure the second layer has correct mask and blend mode
                applyCurrentMaskAndBlend();
                
                // Need to make sure masks get properly rendered
                // Give a small delay for the mask to be properly applied
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Call original download function
                return originalDownloadCardWithCanvas.apply(this, arguments);
            };
        } else {
            console.warn("Card download function not found, cannot enhance");
        }
    }
    
    /**
     * Integrate with the existing dual-type-simple.js module
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
        
        // Override updateSecondLayer
        window.dualTypeSimple.updateSecondLayer = function() {
            // Call original function first
            if (typeof originalUpdateSecondLayer === 'function') {
                originalUpdateSecondLayer.call(window.dualTypeSimple);
            }
            
            // Apply our enhanced mask and blend
            applyCurrentMaskAndBlend();
        };
        
        // Override updateMaskOnLayer
        window.dualTypeSimple.updateMaskOnLayer = function() {
            // Replace with our implementation
            applyCurrentMaskAndBlend();
        };
        
        // Override getCurrentMaskUrl
        window.dualTypeSimple.getCurrentMaskUrl = function() {
            return currentMaskUrl;
        };
        
        console.log("Successfully integrated with dual-type-simple.js");
    }
    
    /**
     * Gets the background style for a card type, stage, and set
     * 
     * @param {string} setKey - The set key
     * @param {string} type - The Pokémon type
     * @param {string} stage - The card stage
     * @returns {{backgroundImage: string, className: string}} The style properties
     */
    function getCardBackgroundStyle(setKey, type, stage) {
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
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Page already loaded
        init();
    }
    
    // Expose public API
    window.enhancedDualType = {
        applyCurrentMaskAndBlend,
        getCardBackgroundStyle,
        getCurrentMaskUrl: () => currentMaskUrl,
        getCurrentBlendMode: () => currentBlendMode,
        setMaskUrl: (url) => {
            currentMaskUrl = url;
            if (maskSelector) maskSelector.value = url;
            applyCurrentMaskAndBlend();
        },
        setBlendMode: (mode) => {
            currentBlendMode = mode;
            if (blendModeSelector) blendModeSelector.value = mode;
            applyCurrentMaskAndBlend();
        },
        addCustomMask: (url, label) => {
            if (!maskSelector) return;
            
            // Add to selector
            const option = document.createElement('option');
            option.value = url;
            option.textContent = label || `Custom: ${url.split('/').pop()}`;
            maskSelector.appendChild(option);
            
            // Add to preview grid
            const previewContainer = document.querySelector('.dual-type-preview');
            if (previewContainer) {
                const previewGrid = previewContainer.querySelector('.preview-grid');
                if (previewGrid) {
                    const previewItem = createPreviewItem({
                        value: url,
                        label: label || `Custom: ${url.split('/').pop()}`
                    }, 'mask');
                    previewGrid.appendChild(previewItem);
                }
            }
        }
    };
})();
