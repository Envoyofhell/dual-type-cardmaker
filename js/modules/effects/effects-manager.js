/**
 * File: js/modules/effects/effects-manager.js
 * Purpose: Manages masks, blend modes, and visual effects
 * Dependencies:
 *   - js/modules/layers/layer-manager.js
 *   - js/modules/persistence/state-manager.js
 * Notes: Handles masks and effects that can be applied to any layer
 */

import layerManager from '../layers/layer-manager.js';
import { saveState, loadState } from '../persistence/state-manager.js';

/**
 * EffectsManager - Handles masks, blend modes, and other visual effects
 */
class EffectsManager {
  /**
   * Initialize the effects manager
   */
  constructor() {
    // Available masks
    this.masks = [
      { value: '', label: 'Default Split (Diagonal)', type: 'clip-path' },
      { value: 'img/mask.png', label: 'Standard Mask', type: 'mask' },
      { value: 'img/masks/horizontal-split.png', label: 'Horizontal Split', type: 'mask' },
      { value: 'img/masks/vertical-split.png', label: 'Vertical Split', type: 'mask' },
      { value: 'img/masks/gradient-fade.png', label: 'Gradient Fade', type: 'mask' },
      { value: 'img/masks/circle-center.png', label: 'Circle Center', type: 'mask' },
      { value: 'img/masks/mask-angle.png', label: 'New Diagonal Pattern', type: 'mask' },
      { value: 'img/masks/mask-star.png', label: 'Star Pattern', type: 'mask' }
    ];
    
    // Available blend modes
    this.blendModes = [
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
    
    // UI elements
    this.maskSelector = document.getElementById('mask-selector');
    this.blendModeSelector = document.getElementById('blend-mode-selector');
    this.maskPreviewContainer = document.querySelector('.mask-previews');
    this.blendModePreviewContainer = document.querySelector('.blend-mode-previews');
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize the effects manager
   */
  initialize() {
    this.loadCustomMasks();
    this.populateMaskSelector();
    this.populateBlendModeSelector();
    this.createMaskPreviews();
    this.createBlendModePreviews();
    this.setupEventListeners();
    
    // Apply any saved effects
    this.applyDefaultEffects();
  }
  
  /**
   * Load custom masks from state
   */
  loadCustomMasks() {
    const customMask = loadState('customMask');
    if (customMask) {
      // Add custom mask to masks array
      this.masks.push({
        value: 'custom',
        label: 'Custom Mask',
        type: 'mask',
        src: customMask
      });
      
      // Store the custom mask URL
      window.customMaskUrl = customMask;
    }
  }
  
  /**
   * Populate the mask selector dropdown
   */
  populateMaskSelector() {
    if (!this.maskSelector) return;
    
    // Clear the selector
    this.maskSelector.innerHTML = '';
    
    // Add options for each mask
    this.masks.forEach(mask => {
      const option = document.createElement('option');
      option.value = mask.value === 'custom' ? 'custom' : mask.value;
      option.textContent = mask.label;
      this.maskSelector.appendChild(option);
    });
    
    // Set default value
    const savedMask = loadState('currentMask');
    if (savedMask) {
      this.maskSelector.value = savedMask === window.customMaskUrl ? 'custom' : savedMask;
    } else {
      this.maskSelector.value = 'img/mask.png'; // Default mask
    }
  }
  
  /**
   * Populate the blend mode selector dropdown
   */
  populateBlendModeSelector() {
    if (!this.blendModeSelector) return;
    
    // Clear the selector
    this.blendModeSelector.innerHTML = '';
    
    // Add options for each blend mode
    this.blendModes.forEach(mode => {
      const option = document.createElement('option');
      option.value = mode.value;
      option.textContent = mode.label;
      this.blendModeSelector.appendChild(option);
    });
    
    // Set default value
    const savedBlendMode = loadState('currentBlendMode');
    if (savedBlendMode) {
      this.blendModeSelector.value = savedBlendMode;
    } else {
      this.blendModeSelector.value = 'normal'; // Default blend mode
    }
  }
  
  /**
   * Create visual mask previews
   */
  createMaskPreviews() {
    if (!this.maskPreviewContainer) return;
    
    // Clear the container
    this.maskPreviewContainer.innerHTML = '';
    
    // Create preview for each mask
    this.masks.forEach(mask => {
      // Create preview item
      const previewItem = document.createElement('div');
      previewItem.className = 'preview-item';
      previewItem.dataset.value = mask.value === 'custom' ? 'custom' : mask.value;
      
      // Mark as active if it's the current selection
      if (this.maskSelector && (
          (mask.value === 'custom' && this.maskSelector.value === 'custom') ||
          (mask.value !== 'custom' && this.maskSelector.value === mask.value)
        )) {
        previewItem.classList.add('active');
      }
      
      // Create preview image
      const previewImg = document.createElement('div');
      previewImg.className = 'preview-img';
      
      // Generate preview image based on mask type
      if (mask.value === '') {
        // Default clip-path
        previewImg.innerHTML = `
          <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="60" fill="#0000FF" />
            <path d="M0,0 L60,0 L0,60 Z" fill="#FF0000" />
          </svg>
        `;
      } else if (mask.value === 'custom' && mask.src) {
        // Custom mask
        const img = document.createElement('img');
        img.src = mask.src;
        previewImg.appendChild(img);
      } else {
        // Standard mask
        const img = document.createElement('img');
        
        // If the mask file exists, use it
        const maskValue = mask.value;
        
        // Create a blue/red background
        const bgSvg = document.createElement('div');
        bgSvg.innerHTML = `
          <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="60" fill="#0000FF" />
            <rect width="60" height="60" fill="#FF0000" style="mask-image: url(${maskValue}); mask-size: contain;" />
          </svg>
        `;
        
        previewImg.appendChild(bgSvg);
      }
      
      // Create label
      const previewLabel = document.createElement('div');
      previewLabel.className = 'preview-label';
      previewLabel.textContent = mask.label;
      
      previewItem.appendChild(previewImg);
      previewItem.appendChild(previewLabel);
      
      // Add click handler
      previewItem.addEventListener('click', () => {
        // Update mask selector
        if (this.maskSelector) {
          this.maskSelector.value = mask.value === 'custom' ? 'custom' : mask.value;
          
          // Trigger change event
          const event = new Event('change');
          this.maskSelector.dispatchEvent(event);
        }
      });
      
      this.maskPreviewContainer.appendChild(previewItem);
    });
  }
  
  /**
   * Create visual blend mode previews
   */
  createBlendModePreviews() {
    if (!this.blendModePreviewContainer) return;
    
    // Clear the container
    this.blendModePreviewContainer.innerHTML = '';
    
    // Create preview for each blend mode
    this.blendModes.forEach(mode => {
      // Create preview item
      const previewItem = document.createElement('div');
      previewItem.className = 'preview-item';
      previewItem.dataset.value = mode.value;
      
      // Mark as active if it's the current selection
      if (this.blendModeSelector && this.blendModeSelector.value === mode.value) {
        previewItem.classList.add('active');
      }
      
      // Create preview image
      const previewImg = document.createElement('div');
      previewImg.className = 'preview-img';
      
      // Generate preview image using SVG
      previewImg.innerHTML = `
        <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="60" fill="#0000FF" />
          <rect x="15" y="15" width="30" height="30" fill="#FF0000" style="mix-blend-mode: ${mode.value};" />
        </svg>
      `;
      
      // Create label
      const previewLabel = document.createElement('div');
      previewLabel.className = 'preview-label';
      previewLabel.textContent = mode.label;
      
      previewItem.appendChild(previewImg);
      previewItem.appendChild(previewLabel);
      
      // Add click handler
      previewItem.addEventListener('click', () => {
        // Update blend mode selector
        if (this.blendModeSelector) {
          this.blendModeSelector.value = mode.value;
          
          // Trigger change event
          const event = new Event('change');
          this.blendModeSelector.dispatchEvent(event);
        }
      });
      
      this.blendModePreviewContainer.appendChild(previewItem);
    });
  }
  
  /**
   * Set up event listeners for effects
   */
  setupEventListeners() {
    // Mask selector
    if (this.maskSelector) {
      this.maskSelector.addEventListener('change', () => {
        const selectedValue = this.maskSelector.value;
        
        // Determine the actual mask URL
        let maskUrl = selectedValue;
        
        // If it's a custom mask, use the stored URL
        if (selectedValue === 'custom' && window.customMaskUrl) {
          maskUrl = window.customMaskUrl;
        }
        
        // Update global variable for compatibility
        window.currentMaskUrl = maskUrl;
        
        // Save the current mask
        saveState('currentMask', selectedValue);
        
        // Apply to active layer or second layer
        this.applyMaskToCurrentTarget(maskUrl);
        
        // Update previews
        this.updateActiveMaskPreview(selectedValue);
      });
    }
    
    // Blend mode selector
    if (this.blendModeSelector) {
      this.blendModeSelector.addEventListener('change', () => {
        const selectedValue = this.blendModeSelector.value;
        
        // Update global variable for compatibility
        window.currentBlendMode = selectedValue;
        
        // Save the current blend mode
        saveState('currentBlendMode', selectedValue);
        
        // Apply to active layer or second layer
        this.applyBlendModeToCurrentTarget(selectedValue);
        
        // Update previews
        this.updateActiveBlendModePreview(selectedValue);
      });
    }
    
    // Holographic effect toggle
    const holoToggle = document.getElementById('holo-effect');
    if (holoToggle) {
      holoToggle.addEventListener('change', () => {
        this.applyHolographicEffect(holoToggle.checked);
      });
      
      // Set initial state
      const savedHoloEffect = loadState('holographicEffect');
      if (savedHoloEffect !== null) {
        holoToggle.checked = savedHoloEffect;
        this.applyHolographicEffect(savedHoloEffect);
      }
    }
    
    // Listen for layer selection changes
    document.addEventListener('layerselected', (e) => {
      const layerId = e.detail.layerId;
      const layer = layerManager.getLayerById(layerId);
      
      if (layer) {
        // Update UI to reflect layer's current effects
        this.updateUIForLayer(layer);
      }
    });
  }
  
  /**
   * Apply default effects from saved state
   */
  applyDefaultEffects() {
    // Apply mask
    const savedMask = loadState('currentMask');
    if (savedMask) {
      let maskUrl = savedMask;
      
      // If it's a custom mask, use the stored URL
      if (savedMask === 'custom' && window.customMaskUrl) {
        maskUrl = window.customMaskUrl;
      }
      
      // Set global variable
      window.currentMaskUrl = maskUrl;
      
      // Apply to second layer
      this.applyMaskToSecondLayer(maskUrl);
    }
    
    // Apply blend mode
    const savedBlendMode = loadState('currentBlendMode');
    if (savedBlendMode) {
      // Set global variable
      window.currentBlendMode = savedBlendMode;
      
      // Apply to second layer
      this.applyBlendModeToSecondLayer(savedBlendMode);
    }
    
    // Apply holographic effect
    const savedHoloEffect = loadState('holographicEffect');
    if (savedHoloEffect !== null) {
      this.applyHolographicEffect(savedHoloEffect);
    }
  }
  
  /**
   * Apply a mask to the current target (active layer or second layer)
   * @param {string} maskUrl - The mask URL
   */
  applyMaskToCurrentTarget(maskUrl) {
    // If there's an active layer in the layer manager, apply to that
    const activeLayer = layerManager.getActiveLayer();
    
    if (activeLayer && !activeLayer.locked) {
      layerManager.applyMaskToActiveLayer(maskUrl);
    } else {
      // Otherwise apply to second layer
      this.applyMaskToSecondLayer(maskUrl);
    }
  }
  
  /**
   * Apply a mask to the second layer
   * @param {string} maskUrl - The mask URL
   */
  applyMaskToSecondLayer(maskUrl) {
    const secondLayer = document.getElementById('second-card-layer');
    if (!secondLayer) return;
    
    if (maskUrl && maskUrl !== '') {
      // Apply mask
      secondLayer.style.maskImage = `url('${maskUrl}')`;
      secondLayer.style.webkitMaskImage = `url('${maskUrl}')`;
      secondLayer.style.maskSize = 'contain';
      secondLayer.style.webkitMaskSize = 'contain';
      secondLayer.style.maskRepeat = 'no-repeat';
      secondLayer.style.webkitMaskRepeat = 'no-repeat';
      secondLayer.style.maskPosition = 'center';
      secondLayer.style.webkitMaskPosition = 'center';
      
      // Remove clip path
      secondLayer.style.clipPath = 'none';
      secondLayer.style.webkitClipPath = 'none';
    } else {
      // Use default clip path
      secondLayer.style.maskImage = 'none';
      secondLayer.style.webkitMaskImage = 'none';
      
      secondLayer.style.clipPath = 'polygon(0 0, 100% 0, 0 100%)';
      secondLayer.style.webkitClipPath = 'polygon(0 0, 100% 0, 0 100%)';
    }
  }
  
  /**
   * Apply a blend mode to the current target (active layer or second layer)
   * @param {string} blendMode - The blend mode
   */
  applyBlendModeToCurrentTarget(blendMode) {
    // If there's an active layer in the layer manager, apply to that
    const activeLayer = layerManager.getActiveLayer();
    
    if (activeLayer && !activeLayer.locked) {
      layerManager.updateActiveLayerProperty('blendMode', blendMode);
    } else {
      // Otherwise apply to second layer
      this.applyBlendModeToSecondLayer(blendMode);
    }
  }
  
  /**
   * Apply a blend mode to the second layer
   * @param {string} blendMode - The blend mode
   */
  applyBlendModeToSecondLayer(blendMode) {
    const secondLayer = document.getElementById('second-card-layer');
    if (!secondLayer) return;
    
    secondLayer.style.mixBlendMode = blendMode;
  }
  
  /**
   * Apply the holographic effect
   * @param {boolean} enabled - Whether the effect is enabled
   */
  applyHolographicEffect(enabled) {
    const card = document.getElementById('card');
    if (!card) return;
    
    if (enabled) {
      card.classList.add('holographic');
    } else {
      card.classList.remove('holographic');
    }
    
    // Save state
    saveState('holographicEffect', enabled);
  }
  
  /**
   * Update UI to reflect a layer's current effects
   * @param {Object} layer - The layer object
   */
  updateUIForLayer(layer) {
    // Update mask selector
    if (this.maskSelector && layer.mask) {
      // Find the closest match in our masks array
      const matchingMask = this.masks.find(mask => mask.value === layer.mask);
      
      if (matchingMask) {
        this.maskSelector.value = matchingMask.value;
      } else if (layer.mask === window.customMaskUrl) {
        this.maskSelector.value = 'custom';
      }
      
      // Update mask previews
      this.updateActiveMaskPreview(this.maskSelector.value);
    }
    
    // Update blend mode selector
    if (this.blendModeSelector && layer.blendMode) {
      this.blendModeSelector.value = layer.blendMode;
      
      // Update blend mode previews
      this.updateActiveBlendModePreview(layer.blendMode);
    }
  }
  
  /**
   * Update the active mask preview
   * @param {string} value - The mask value
   */
  updateActiveMaskPreview(value) {
    if (!this.maskPreviewContainer) return;
    
    // Remove active class from all preview items
    const previewItems = this.maskPreviewContainer.querySelectorAll('.preview-item');
    previewItems.forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to selected preview item
    const selectedItem = this.maskPreviewContainer.querySelector(`.preview-item[data-value="${value}"]`);
    if (selectedItem) {
      selectedItem.classList.add('active');
    }
  }
  
  /**
   * Update the active blend mode preview
   * @param {string} value - The blend mode value
   */
  updateActiveBlendModePreview(value) {
    if (!this.blendModePreviewContainer) return;
    
    // Remove active class from all preview items
    const previewItems = this.blendModePreviewContainer.querySelectorAll('.preview-item');
    previewItems.forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to selected preview item
    const selectedItem = this.blendModePreviewContainer.querySelector(`.preview-item[data-value="${value}"]`);
    if (selectedItem) {
      selectedItem.classList.add('active');
    }
  }
  
  /**
   * Add a new mask
   * @param {string} maskUrl - The mask URL
   * @param {string} label - The mask label
   */
  addMask(maskUrl, label = 'Custom Mask') {
    // Add to masks array
    this.masks.push({
      value: maskUrl,
      label,
      type: 'mask'
    });
    
    // Update the mask selector
    this.populateMaskSelector();
    
    // Update the mask previews
    this.createMaskPreviews();
    
    // Apply the new mask
    this.applyMaskToCurrentTarget(maskUrl);
  }
  
  /**
   * Get the current mask URL
   * @returns {string} The current mask URL
   */
  getCurrentMaskUrl() {
    // If it's a custom mask, use the stored URL
    if (this.maskSelector && this.maskSelector.value === 'custom') {
      return window.customMaskUrl || '';
    }
    
    // Otherwise use the selected value
    return this.maskSelector ? this.maskSelector.value : '';
  }
  
  /**
   * Get the current blend mode
   * @returns {string} The current blend mode
   */
  getCurrentBlendMode() {
    return this.blendModeSelector ? this.blendModeSelector.value : 'normal';
  }
}

// Create and export a singleton instance
const effectsManager = new EffectsManager();

// Set global variables for compatibility with existing code
window.currentMaskUrl = effectsManager.getCurrentMaskUrl();
window.currentBlendMode = effectsManager.getCurrentBlendMode();

export default effectsManager;