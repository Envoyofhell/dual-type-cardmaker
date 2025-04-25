/**
 * File: js/modules/layers/layer-manager.js
 * Purpose: Manages the layer system for the card editor
 * Dependencies: 
 *   - js/modules/persistence/state-manager.js
 * Notes: Core component for managing image layers and their properties
 */

import { saveState, loadState } from '../persistence/state-manager.js';

/**
 * LayerManager - Handles creation, modification, and rendering of layers
 */
class LayerManager {
  /**
   * Initialize the layer manager
   * @param {string} cardSelector - Selector for the card element
   * @param {string} layerListSelector - Selector for the layer list container
   */
  constructor(cardSelector = '#card', layerListSelector = '#layer-list') {
    // DOM elements
    this.cardElement = document.querySelector(cardSelector);
    this.layerListElement = document.querySelector(layerListSelector);
    
    // Layer storage
    this.layers = [];
    this.activeLayerIndex = -1;
    
    // Property control elements
    this.layerNameInput = document.getElementById('layer-name');
    this.layerOpacityInput = document.getElementById('layer-opacity');
    this.layerBlendModeInput = document.getElementById('layer-blend-mode');
    this.layerXInput = document.getElementById('layer-x');
    this.layerYInput = document.getElementById('layer-y');
    this.layerWidthInput = document.getElementById('layer-width');
    this.layerHeightInput = document.getElementById('layer-height');
    
    // Buttons
    this.addLayerButton = document.getElementById('add-layer-btn');
    
    // Setup
    this.initialize();
  }
  
  /**
   * Initialize the layer manager
   */
  initialize() {
    if (!this.cardElement || !this.layerListElement) {
      console.error('Layer manager initialization failed: elements not found');
      return;
    }
    
    // Create default layers if none exist
    this.loadLayers();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initial render
    this.renderLayers();
    this.renderLayerList();
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Add layer button
    if (this.addLayerButton) {
      this.addLayerButton.addEventListener('click', () => this.addLayer());
    }
    
    // Property controls
    if (this.layerNameInput) {
      this.layerNameInput.addEventListener('input', () => {
        this.updateActiveLayerProperty('name', this.layerNameInput.value);
      });
    }
    
    if (this.layerOpacityInput) {
      this.layerOpacityInput.addEventListener('input', () => {
        const opacityValue = this.layerOpacityInput.value;
        this.updateActiveLayerProperty('opacity', opacityValue / 100);
        
        // Update the displayed value
        const valueDisplay = this.layerOpacityInput.nextElementSibling;
        if (valueDisplay) {
          valueDisplay.textContent = `${opacityValue}%`;
        }
      });
    }
    
    if (this.layerBlendModeInput) {
      this.layerBlendModeInput.addEventListener('change', () => {
        this.updateActiveLayerProperty('blendMode', this.layerBlendModeInput.value);
      });
    }
    
    if (this.layerXInput) {
      this.layerXInput.addEventListener('input', () => {
        this.updateActiveLayerProperty('x', parseInt(this.layerXInput.value, 10));
      });
    }
    
    if (this.layerYInput) {
      this.layerYInput.addEventListener('input', () => {
        this.updateActiveLayerProperty('y', parseInt(this.layerYInput.value, 10));
      });
    }
    
    if (this.layerWidthInput) {
      this.layerWidthInput.addEventListener('input', () => {
        this.updateActiveLayerProperty('width', parseInt(this.layerWidthInput.value, 10));
      });
    }
    
    if (this.layerHeightInput) {
      this.layerHeightInput.addEventListener('input', () => {
        this.updateActiveLayerProperty('height', parseInt(this.layerHeightInput.value, 10));
      });
    }
    
    // Handle drag and drop for layer image upload
    const layerImageDrop = document.getElementById('layer-image-drop');
    if (layerImageDrop) {
      layerImageDrop.addEventListener('dragover', (e) => {
        e.preventDefault();
        layerImageDrop.classList.add('dragover');
      });
      
      layerImageDrop.addEventListener('dragleave', () => {
        layerImageDrop.classList.remove('dragover');
      });
      
      layerImageDrop.addEventListener('drop', (e) => {
        e.preventDefault();
        layerImageDrop.classList.remove('dragover');
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleImageUpload(e.dataTransfer.files[0]);
        }
      });
      
      layerImageDrop.addEventListener('click', () => {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        // Add it to the DOM, click it, and then remove it
        document.body.appendChild(fileInput);
        
        fileInput.addEventListener('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            this.handleImageUpload(e.target.files[0]);
          }
          document.body.removeChild(fileInput);
        });
        
        fileInput.click();
      });
    }
  }
  
  /**
   * Load layers from state
   */
  loadLayers() {
    const savedLayers = loadState('layers');
    
    if (savedLayers && savedLayers.length > 0) {
      this.layers = savedLayers;
      
      // Make sure layer elements exist
      this.layers.forEach(layer => {
        if (layer.type === 'image' && layer.src) {
          // Preload the image
          const img = new Image();
          img.src = layer.src;
        }
      });
    } else {
      // Create default layers
      this.initializeDefaultLayers();
    }
    
    // Set the active layer to the first one if none is selected
    if (this.activeLayerIndex === -1 && this.layers.length > 0) {
      this.activeLayerIndex = 0;
    }
  }
  
  /**
   * Initialize default layers
   */
  initializeDefaultLayers() {
    // Card background layer (always present)
    this.layers.push({
      id: 'background',
      name: 'Card Background',
      type: 'card',
      visible: true,
      locked: true,
      opacity: 1,
      blendMode: 'normal',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      zIndex: 0
    });
    
    // Card content layer (always present)
    this.layers.push({
      id: 'card-content',
      name: 'Card Content',
      type: 'content',
      visible: true,
      locked: true,
      opacity: 1,
      blendMode: 'normal',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      zIndex: 10
    });
  }
  
  /**
   * Save layers to state
   */
  saveLayers() {
    saveState('layers', this.layers);
  }
  
  /**
   * Render all layers to the card
   */
  renderLayers() {
    if (!this.cardElement) return;
    
    // Clear existing layers
    const existingLayers = this.cardElement.querySelectorAll('.layer-element:not(.card-container)');
    existingLayers.forEach(layer => {
      layer.remove();
    });
    
    // Sort layers by z-index
    const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);
    
    // Render each layer
    sortedLayers.forEach(layer => {
      if (!layer.visible) return;
      
      if (layer.type === 'card' || layer.type === 'content') {
        // These are handled separately by the card system
        return;
      }
      
      // Create layer element
      const layerElement = document.createElement('div');
      layerElement.className = 'layer-element';
      layerElement.id = `layer-${layer.id}`;
      layerElement.style.position = 'absolute';
      layerElement.style.top = `${layer.y}%`;
      layerElement.style.left = `${layer.x}%`;
      layerElement.style.width = `${layer.width}%`;
      layerElement.style.height = `${layer.height}%`;
      layerElement.style.opacity = layer.opacity;
      layerElement.style.mixBlendMode = layer.blendMode;
      layerElement.style.zIndex = layer.zIndex;
      layerElement.style.pointerEvents = 'none';
      
      if (layer.type === 'image' && layer.src) {
        // Create image element
        const img = document.createElement('img');
        img.src = layer.src;
        img.alt = layer.name;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = layer.objectFit || 'cover';
        
        layerElement.appendChild(img);
      }
      
      // Apply mask if present
      if (layer.mask) {
        layerElement.style.maskImage = `url(${layer.mask})`;
        layerElement.style.webkitMaskImage = `url(${layer.mask})`;
        layerElement.style.maskSize = 'contain';
        layerElement.style.webkitMaskSize = 'contain';
        layerElement.style.maskRepeat = 'no-repeat';
        layerElement.style.webkitMaskRepeat = 'no-repeat';
        layerElement.style.maskPosition = 'center';
        layerElement.style.webkitMaskPosition = 'center';
      }
      
      // Add to card
      this.cardElement.appendChild(layerElement);
    });
    
    // Make sure card container is on top
    const cardContainer = this.cardElement.querySelector('.card-container');
    if (cardContainer) {
      // Find the content layer
      const contentLayer = this.layers.find(layer => layer.id === 'card-content');
      if (contentLayer) {
        cardContainer.style.zIndex = contentLayer.zIndex;
      } else {
        cardContainer.style.zIndex = 10; // Default z-index for content
      }
    }
  }
  
  /**
   * Render the layer list UI
   */
  renderLayerList() {
    if (!this.layerListElement) return;
    
    // Clear the list
    this.layerListElement.innerHTML = '';
    
    // Sort layers by z-index (reverse for UI display)
    const sortedLayers = [...this.layers].sort((a, b) => b.zIndex - a.zIndex);
    
    // Create an item for each layer
    sortedLayers.forEach((layer, index) => {
      const layerItem = document.createElement('div');
      layerItem.className = 'layer-item';
      if (index === this.activeLayerIndex) {
        layerItem.classList.add('active');
      }
      
      layerItem.dataset.layerId = layer.id;
      
      // Layer thumbnail
      const layerIcon = document.createElement('div');
      layerIcon.className = 'layer-icon';
      
      if (layer.type === 'image' && layer.src) {
        const img = document.createElement('img');
        img.src = layer.src;
        img.alt = layer.name;
        layerIcon.appendChild(img);
      } else {
        // Placeholder for non-image layers
        layerIcon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="white" stroke-width="2"/>
          <path d="M2 8H22" stroke="white" stroke-width="2"/>
        </svg>`;
      }
      
      layerItem.appendChild(layerIcon);
      
      // Layer info
      const layerInfo = document.createElement('div');
      layerInfo.className = 'layer-info';
      
      const layerName = document.createElement('div');
      layerName.className = 'layer-name';
      layerName.textContent = layer.name;
      
      const layerType = document.createElement('div');
      layerType.className = 'layer-type';
      layerType.textContent = layer.type.charAt(0).toUpperCase() + layer.type.slice(1);
      
      layerInfo.appendChild(layerName);
      layerInfo.appendChild(layerType);
      layerItem.appendChild(layerInfo);
      
      // Layer controls
      const layerControls = document.createElement('div');
      layerControls.className = 'layer-controls';
      
      // Visibility toggle
      const visibilityButton = document.createElement('button');
      visibilityButton.className = 'layer-visibility-toggle';
      visibilityButton.innerHTML = layer.visible ? 
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M12 4C7 4 2.73 7.11 1 12C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12C21.27 7.11 17 4 12 4ZM12 18C8.13 18 5 15.5 3.25 12C5 8.5 8.13 6 12 6C15.87 6 19 8.5 20.75 12C19 15.5 15.87 18 12 18ZM12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14Z" fill="white"/>' +
        '</svg>' :
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M12 6C15.79 6 19.17 8.13 20.82 12C20.23 13.21 19.4 14.28 18.41 15.12L19.82 16.53C21.21 15.33 22.31 13.77 23 12C21.27 7.11 17 4 12 4C10.73 4 9.51 4.2 8.36 4.57L10.01 6.22C10.66 6.08 11.32 6 12 6Z" fill="white"/>' +
          '<path d="M10.93 7.14L13 9.21C13.57 9.46 14.03 9.92 14.28 10.49L16.35 12.56C16.43 12.38 16.49 12.19 16.49 12C16.5 9.79 14.71 8 12.5 8C11.93 8 11.4 8.15 10.93 8.33L10.93 7.14Z" fill="white"/>' +
          '<path d="M2.00999 3.87L4.73999 6.6C3.07999 7.97 1.89999 9.91 1.00999 12C2.73999 16.89 6.99999 20 12 20C13.52 20 14.97 19.7 16.33 19.15L19.74 22.56L21.15 21.15L3.42999 3.43L2.00999 3.87ZM7.52999 9.39L9.07999 10.94C9.02999 11.28 8.99999 11.63 8.99999 12C8.99999 14.21 10.79 16 13 16C13.37 16 13.72 15.97 14.06 15.92L15.61 17.47C14.5 17.83 13.28 18 12 18C8.20999 18 4.82999 15.87 3.17999 12C4.04999 10.35 5.34999 8.99 6.89999 8.01L7.52999 9.39Z" fill="white"/>' +
        '</svg>';
      
      visibilityButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent selecting the layer
        this.toggleLayerVisibility(layer.id);
      });
      
      layerControls.appendChild(visibilityButton);
      
      // Only add move controls if the layer is not locked
      if (!layer.locked) {
        // Move up button
        const moveUpButton = document.createElement('button');
        moveUpButton.className = 'layer-move-up';
        moveUpButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z" fill="white"/>' +
        '</svg>';
        
        moveUpButton.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent selecting the layer
          this.moveLayerUp(layer.id);
        });
        
        layerControls.appendChild(moveUpButton);
        
        // Move down button
        const moveDownButton = document.createElement('button');
        moveDownButton.className = 'layer-move-down';
        moveDownButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" fill="white"/>' +
        '</svg>';
        
        moveDownButton.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent selecting the layer
          this.moveLayerDown(layer.id);
        });
        
        layerControls.appendChild(moveDownButton);
      }
      
      layerItem.appendChild(layerControls);
      
      // Add click handler to select the layer
      layerItem.addEventListener('click', () => {
        this.selectLayer(layer.id);
      });
      
      this.layerListElement.appendChild(layerItem);
    });
  }
  
  /**
   * Add a new layer
   * @param {Object} layerProperties - Properties for the new layer
   * @returns {string} The ID of the new layer
   */
  addLayer(layerProperties = {}) {
    // Generate a unique ID
    const id = 'layer_' + Date.now();
    
    // Find the highest z-index
    const highestZIndex = this.layers.reduce((max, layer) => {
      return Math.max(max, layer.zIndex);
    }, 0);
    
    // Create the new layer with defaults
    const newLayer = {
      id,
      name: layerProperties.name || `Layer ${this.layers.length + 1}`,
      type: layerProperties.type || 'image',
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'normal',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      zIndex: highestZIndex + 1,
      ...layerProperties
    };
    
    // Add to layers array
    this.layers.push(newLayer);
    
    // Select the new layer
    this.selectLayer(id);
    
    // Save state
    this.saveLayers();
    
    // Render updates
    this.renderLayers();
    this.renderLayerList();
    
    return id;
  }
  
  /**
   * Remove a layer by ID
   * @param {string} layerId - The ID of the layer to remove
   */
  removeLayer(layerId) {
    // Don't allow removing locked layers
    const layerIndex = this.layers.findIndex(layer => layer.id === layerId);
    if (layerIndex === -1) return;
    
    const layer = this.layers[layerIndex];
    if (layer.locked) {
      console.warn(`Cannot remove locked layer: ${layer.name}`);
      return;
    }
    
    // Remove the layer
    this.layers.splice(layerIndex, 1);
    
    // Update active layer if needed
    if (this.layers[this.activeLayerIndex]?.id === layerId) {
      this.activeLayerIndex = Math.max(0, layerIndex - 1);
    }
    
    // Save state
    this.saveLayers();
    
    // Render updates
    this.renderLayers();
    this.renderLayerList();
  }
  
  /**
   * Select a layer by ID
   * @param {string} layerId - The ID of the layer to select
   */
  selectLayer(layerId) {
    const layerIndex = this.layers.findIndex(layer => layer.id === layerId);
    if (layerIndex === -1) return;
    
    this.activeLayerIndex = layerIndex;
    const activeLayer = this.layers[this.activeLayerIndex];
    
    // Update the property controls
    this.updatePropertyControls(activeLayer);
    
    // Update the layer list UI
    this.renderLayerList();
  }
  
  /**
   * Toggle a layer's visibility
   * @param {string} layerId - The ID of the layer to toggle
   */
  toggleLayerVisibility(layerId) {
    const layerIndex = this.layers.findIndex(layer => layer.id === layerId);
    if (layerIndex === -1) return;
    
    // Toggle visibility
    this.layers[layerIndex].visible = !this.layers[layerIndex].visible;
    
    // Save state
    this.saveLayers();
    
    // Render updates
    this.renderLayers();
    this.renderLayerList();
  }
  
  /**
   * Move a layer up in the stack (increase z-index)
   * @param {string} layerId - The ID of the layer to move
   */
  moveLayerUp(layerId) {
    const layerIndex = this.layers.findIndex(layer => layer.id === layerId);
    if (layerIndex === -1) return;
    
    const layer = this.layers[layerIndex];
    
    // Find the layer with the next highest z-index
    const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);
    const currentIndex = sortedLayers.findIndex(l => l.id === layerId);
    
    if (currentIndex < sortedLayers.length - 1) {
      const nextLayer = sortedLayers[currentIndex + 1];
      
      // Skip locked layers
      if (nextLayer.locked) {
        return;
      }
      
      // Swap z-indices
      const tempZIndex = layer.zIndex;
      layer.zIndex = nextLayer.zIndex;
      nextLayer.zIndex = tempZIndex;
      
      // Save state
      this.saveLayers();
      
      // Render updates
      this.renderLayers();
      this.renderLayerList();
    }
  }
  
  /**
   * Move a layer down in the stack (decrease z-index)
   * @param {string} layerId - The ID of the layer to move
   */
  moveLayerDown(layerId) {
    const layerIndex = this.layers.findIndex(layer => layer.id === layerId);
    if (layerIndex === -1) return;
    
    const layer = this.layers[layerIndex];
    
    // Find the layer with the next lowest z-index
    const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);
    const currentIndex = sortedLayers.findIndex(l => l.id === layerId);
    
    if (currentIndex > 0) {
      const prevLayer = sortedLayers[currentIndex - 1];
      
      // Skip locked layers
      if (prevLayer.locked) {
        return;
      }
      
      // Swap z-indices
      const tempZIndex = layer.zIndex;
      layer.zIndex = prevLayer.zIndex;
      prevLayer.zIndex = tempZIndex;
      
      // Save state
      this.saveLayers();
      
      // Render updates
      this.renderLayers();
      this.renderLayerList();
    }
  }
  
  /**
   * Update a property of the active layer
   * @param {string} property - The property to update
   * @param {any} value - The new value
   */
  updateActiveLayerProperty(property, value) {
    if (this.activeLayerIndex === -1) return;
    
    const activeLayer = this.layers[this.activeLayerIndex];
    
    // Don't update properties of locked layers
    if (activeLayer.locked) {
      console.warn(`Cannot update property ${property} of locked layer: ${activeLayer.name}`);
      // Reset the control to the current value
      this.updatePropertyControls(activeLayer);
      return;
    }
    
    // Update the property
    activeLayer[property] = value;
    
    // Save state
    this.saveLayers();
    
    // Render updates
    this.renderLayers();
  }
  
  /**
   * Update the property controls to reflect the active layer
   * @param {Object} layer - The active layer
   */
  updatePropertyControls(layer) {
    // If no layer is selected, disable controls
    if (!layer) {
      this.disablePropertyControls();
      return;
    }
    
    // Name
    if (this.layerNameInput) {
      this.layerNameInput.value = layer.name;
      this.layerNameInput.disabled = layer.locked;
    }
    
    // Opacity
    if (this.layerOpacityInput) {
      this.layerOpacityInput.value = Math.round(layer.opacity * 100);
      this.layerOpacityInput.disabled = layer.locked;
      
      // Update the displayed value
      const valueDisplay = this.layerOpacityInput.nextElementSibling;
      if (valueDisplay) {
        valueDisplay.textContent = `${Math.round(layer.opacity * 100)}%`;
      }
    }
    
    // Blend Mode
    if (this.layerBlendModeInput) {
      this.layerBlendModeInput.value = layer.blendMode;
      this.layerBlendModeInput.disabled = layer.locked;
    }
    
    // Position
    if (this.layerXInput) {
      this.layerXInput.value = layer.x;
      this.layerXInput.disabled = layer.locked;
    }
    
    if (this.layerYInput) {
      this.layerYInput.value = layer.y;
      this.layerYInput.disabled = layer.locked;
    }
    
    // Size
    if (this.layerWidthInput) {
      this.layerWidthInput.value = layer.width;
      this.layerWidthInput.disabled = layer.locked;
    }
    
    if (this.layerHeightInput) {
      this.layerHeightInput.value = layer.height;
      this.layerHeightInput.disabled = layer.locked;
    }
  }
  
  /**
   * Disable all property controls
   */
  disablePropertyControls() {
    // Name
    if (this.layerNameInput) {
      this.layerNameInput.value = '';
      this.layerNameInput.disabled = true;
    }
    
    // Opacity
    if (this.layerOpacityInput) {
      this.layerOpacityInput.value = 100;
      this.layerOpacityInput.disabled = true;
      
      // Update the displayed value
      const valueDisplay = this.layerOpacityInput.nextElementSibling;
      if (valueDisplay) {
        valueDisplay.textContent = '100%';
      }
    }
    
    // Blend Mode
    if (this.layerBlendModeInput) {
      this.layerBlendModeInput.value = 'normal';
      this.layerBlendModeInput.disabled = true;
    }
    
    // Position
    if (this.layerXInput) {
      this.layerXInput.value = 0;
      this.layerXInput.disabled = true;
    }
    
    if (this.layerYInput) {
      this.layerYInput.value = 0;
      this.layerYInput.disabled = true;
    }
    
    // Size
    if (this.layerWidthInput) {
      this.layerWidthInput.value = 100;
      this.layerWidthInput.disabled = true;
    }
    
    if (this.layerHeightInput) {
      this.layerHeightInput.value = 100;
      this.layerHeightInput.disabled = true;
    }
  }
  
  /**
   * Handle image upload for the active layer
   * @param {File} file - The uploaded image file
   */
  handleImageUpload(file) {
    if (this.activeLayerIndex === -1) {
      // If no layer is selected, create a new one
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const layerId = this.addLayer({
          name: file.name.split('.')[0],
          type: 'image',
          src: e.target.result
        });
        
        this.selectLayer(layerId);
      };
      
      reader.readAsDataURL(file);
    } else {
      // Update the active layer
      const activeLayer = this.layers[this.activeLayerIndex];
      
      if (activeLayer.locked) {
        console.warn(`Cannot update image of locked layer: ${activeLayer.name}`);
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        activeLayer.src = e.target.result;
        activeLayer.type = 'image';
        
        // Auto-update the layer name if it's the default
        if (activeLayer.name.startsWith('Layer ')) {
          activeLayer.name = file.name.split('.')[0];
        }
        
        // Save state
        this.saveLayers();
        
        // Update UI
        this.updatePropertyControls(activeLayer);
        this.renderLayers();
        this.renderLayerList();
      };
      
      reader.readAsDataURL(file);
    }
  }
  
  /**
   * Apply a mask to the active layer
   * @param {string} maskUrl - URL of the mask to apply
   */
  applyMaskToActiveLayer(maskUrl) {
    if (this.activeLayerIndex === -1) return;
    
    const activeLayer = this.layers[this.activeLayerIndex];
    
    if (activeLayer.locked) {
      console.warn(`Cannot apply mask to locked layer: ${activeLayer.name}`);
      return;
    }
    
    // Update the mask
    activeLayer.mask = maskUrl;
    
    // Save state
    this.saveLayers();
    
    // Render updates
    this.renderLayers();
  }
  
  /**
   * Get all layers
   * @returns {Array} The layers array
   */
  getLayers() {
    return [...this.layers];
  }
  
  /**
   * Get the active layer
   * @returns {Object|null} The active layer or null if none is selected
   */
  getActiveLayer() {
    if (this.activeLayerIndex === -1) return null;
    return this.layers[this.activeLayerIndex];
  }
}

// Create and export a singleton instance
const layerManager = new LayerManager();

export default layerManager;