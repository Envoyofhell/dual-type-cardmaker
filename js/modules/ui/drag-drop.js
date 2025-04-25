/**
 * File: js/modules/ui/drag-drop.js
 * Purpose: Provides enhanced drag and drop functionality for images and types
 * Dependencies: 
 *   - js/modules/layers/layer-manager.js
 * Notes: Implements drag and drop for images, type icons, and layers
 */

import layerManager from '../layers/layer-manager.js';
import { saveState } from '../persistence/state-manager.js';

/**
 * DragDropManager - Manages drag and drop operations for card elements
 */
class DragDropManager {
  /**
   * Initialize the drag and drop manager
   */
  constructor() {
    // Drop zones
    this.primaryTypeDrop = document.getElementById('primary-type-drop');
    this.secondaryTypeDrop = document.getElementById('secondary-type-drop');
    this.layerImageDrop = document.getElementById('layer-image-drop');
    this.customDropAreas = document.querySelectorAll('.custom-drop-area');
    
    // Draggable elements
    this.typeIcons = document.querySelectorAll('.type-icon');
    this.layerItems = document.querySelectorAll('.layer-item');
    
    // State
    this.cardTypes = {
      primary: null,
      secondary: null
    };
    
    this.initialize();
  }
  
  /**
   * Initialize the drag and drop manager
   */
  initialize() {
    this.setupTypeIconDragEvents();
    this.setupDropZoneEvents();
    this.setupLayerItemDragEvents();
    this.setupCustomDropAreas();
  }
  
  /**
   * Set up drag events for type icons
   */
  setupTypeIconDragEvents() {
    this.typeIcons.forEach(icon => {
      icon.setAttribute('draggable', 'true');
      
      icon.addEventListener('dragstart', (e) => {
        const typeValue = icon.getAttribute('data-type');
        const isSecondary = icon.closest('#secondary-type-selector') !== null;
        
        // Store drag data
        e.dataTransfer.setData('text/plain', JSON.stringify({
          type: 'type-icon',
          value: typeValue,
          isSecondary
        }));
        
        // Add a dragging class
        icon.classList.add('dragging');
      });
      
      icon.addEventListener('dragend', () => {
        icon.classList.remove('dragging');
      });
    });
  }
  
  /**
   * Set up drag and drop events for layer items
   */
  setupLayerItemDragEvents() {
    this.layerItems.forEach(item => {
      item.setAttribute('draggable', 'true');
      
      item.addEventListener('dragstart', (e) => {
        const layerId = item.getAttribute('data-layer-id');
        
        // Store drag data
        e.dataTransfer.setData('text/plain', JSON.stringify({
          type: 'layer-item',
          layerId
        }));
        
        // Add a dragging class
        item.classList.add('dragging');
      });
      
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });
    });
    
    // Handle drag over and drop for the layer list
    const layerList = document.getElementById('layer-list');
    if (layerList) {
      layerList.addEventListener('dragover', (e) => {
        e.preventDefault();
        
        // Find the closest layer item
        const afterElement = this.getDragAfterElement(layerList, e.clientY);
        const draggable = document.querySelector('.layer-item.dragging');
        
        if (afterElement == null) {
          layerList.appendChild(draggable);
        } else {
          layerList.insertBefore(draggable, afterElement);
        }
      });
      
      layerList.addEventListener('drop', (e) => {
        e.preventDefault();
        
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          
          if (data.type === 'layer-item') {
            // Handle layer reordering
            this.handleLayerReordering(layerList);
          }
        } catch (error) {
          console.error('Error parsing drag data:', error);
        }
      });
    }
  }
  
  /**
   * Set up drop events for drop zones
   */
  setupDropZoneEvents() {
    // Primary type drop
    if (this.primaryTypeDrop) {
      this.setupDropZone(this.primaryTypeDrop, (data) => {
        if (data.type === 'type-icon') {
          this.updateCardType('primary', data.value);
        }
      });
    }
    
    // Secondary type drop
    if (this.secondaryTypeDrop) {
      this.setupDropZone(this.secondaryTypeDrop, (data) => {
        if (data.type === 'type-icon') {
          this.updateCardType('secondary', data.value);
          
          // Enable dual type if not already enabled
          const dualTypeToggle = document.getElementById('dual-type-toggle');
          if (dualTypeToggle && !dualTypeToggle.checked) {
            dualTypeToggle.checked = true;
            
            // Trigger the change event
            const event = new Event('change');
            dualTypeToggle.dispatchEvent(event);
          }
        }
      });
    }
    
    // Layer image drop
    if (this.layerImageDrop) {
      this.setupDropZone(this.layerImageDrop, null, true);
    }
  }
  
  /**
   * Set up custom drop areas
   */
  setupCustomDropAreas() {
    this.customDropAreas.forEach(area => {
      this.setupCustomDropArea(area);
    });
  }
  
  /**
   * Set up a custom drop area
   * @param {HTMLElement} area - The drop area element
   */
  setupCustomDropArea(area) {
    area.addEventListener('dragover', (e) => {
      e.preventDefault();
      area.classList.add('active');
    });
    
    area.addEventListener('dragleave', () => {
      area.classList.remove('active');
    });
    
    area.addEventListener('drop', (e) => {
      e.preventDefault();
      area.classList.remove('active');
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        
        // Process the file based on the drop area ID
        this.processCustomDropFile(area.id, file);
      }
    });
    
    // Also handle click to upload
    area.addEventListener('click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.processCustomDropFile(area.id, e.target.files[0]);
        }
        document.body.removeChild(fileInput);
      });
      
      document.body.appendChild(fileInput);
      fileInput.click();
    });
  }
  
  /**
   * Set up a drop zone
   * @param {HTMLElement} element - The drop zone element
   * @param {Function} callback - Callback function when an item is dropped
   * @param {boolean} acceptFiles - Whether to accept file drops
   */
  setupDropZone(element, callback, acceptFiles = false) {
    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      element.classList.add('dragover');
    });
    
    element.addEventListener('dragleave', () => {
      element.classList.remove('dragover');
    });
    
    element.addEventListener('drop', (e) => {
      e.preventDefault();
      element.classList.remove('dragover');
      
      // Handle file drops if accepted
      if (acceptFiles && e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          this.handleImageUpload(file);
        }
        return;
      }
      
      // Handle dragged items
      try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (callback) {
          callback(data);
        }
      } catch (error) {
        console.error('Error parsing drag data:', error);
      }
    });
    
    // Also handle click to upload for file drop zones
    if (acceptFiles) {
      element.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            this.handleImageUpload(e.target.files[0]);
          }
          document.body.removeChild(fileInput);
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
      });
    }
  }
  
  /**
   * Handle layer reordering after drop
   * @param {HTMLElement} layerList - The layer list element
   */
  handleLayerReordering(layerList) {
    // Get all layer items in their new order
    const layerItems = layerList.querySelectorAll('.layer-item');
    const layers = layerManager.getLayers();
    
    // Calculate new z-indices based on new order
    const layerIds = Array.from(layerItems).map(item => item.getAttribute('data-layer-id'));
    
    // Update z-indices (reversed because higher in list = higher z-index)
    const updatedLayers = layers.map(layer => {
      const index = layerIds.indexOf(layer.id);
      if (index !== -1) {
        // Calculate new z-index based on position
        // Higher in list = higher z-index
        layer.zIndex = layers.length - index;
      }
      return layer;
    });
    
    // Update layers in the manager
    layerManager.updateLayers(updatedLayers);
    
    // Refresh the view
    layerManager.renderLayers();
    layerManager.renderLayerList();
  }
  
  /**
   * Get the element after which a dragged item should be placed
   * @param {HTMLElement} container - The container element
   * @param {number} y - The Y coordinate of the mouse
   * @returns {HTMLElement|null} The element after which the dragged item should be placed
   */
  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.layer-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
  
  /**
   * Update the card type
   * @param {string} position - 'primary' or 'secondary'
   * @param {string} typeValue - The type value
   */
  updateCardType(position, typeValue) {
    this.cardTypes[position] = typeValue;
    
    // Update the type preview
    const typePreview = position === 'primary' 
      ? this.primaryTypeDrop.querySelector('.type-preview')
      : this.secondaryTypeDrop.querySelector('.type-preview');
    
    if (typePreview) {
      // Clear existing content
      typePreview.innerHTML = '';
      
      // Create the type icon
      const img = document.createElement('img');
      img.src = `img/${typeValue}.png`;
      img.alt = typeValue;
      typePreview.appendChild(img);
    }
    
    // Call the appropriate function based on position
    if (position === 'primary') {
      this.updatePrimaryType(typeValue);
    } else {
      this.updateSecondaryType(typeValue);
    }
    
    // Save the types state
    saveState('types', this.cardTypes);
  }
  
  /**
   * Update the primary type
   * @param {string} typeValue - The type value
   */
  updatePrimaryType(typeValue) {
    // Find and click the corresponding type selector
    const typeSelector = document.querySelector(`.select-type[value="${typeValue}"]`);
    if (typeSelector) {
      typeSelector.click();
    }
  }
  
  /**
   * Update the secondary type
   * @param {string} typeValue - The type value
   */
  updateSecondaryType(typeValue) {
    // Find and click the corresponding type selector
    const typeSelector = document.querySelector(`.select-second-type[value="${typeValue}"]`);
    if (typeSelector) {
      typeSelector.click();
    }
  }
  
  /**
   * Handle image upload
   * @param {File} file - The uploaded image file
   */
  handleImageUpload(file) {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        // Add a new layer with this image
        layerManager.addLayer({
          name: file.name.split('.')[0],
          type: 'image',
          src: e.target.result
        });
      };
      
      reader.readAsDataURL(file);
    }
  }
  
  /**
   * Process a file dropped on a custom drop area
   * @param {string} areaId - The ID of the drop area
   * @param {File} file - The dropped file
   */
  processCustomDropFile(areaId, file) {
    if (!file.type.startsWith('image/')) {
      console.warn('Not an image file');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      switch (areaId) {
        case 'custom-primary':
          // Apply custom primary type image
          this.applyCustomImage('primary', e.target.result);
          break;
          
        case 'custom-secondary':
          // Apply custom secondary type image
          this.applyCustomImage('secondary', e.target.result);
          break;
          
        case 'custom-mask':
          // Apply custom mask
          this.applyCustomMask(e.target.result);
          break;
          
        case 'custom-bg':
          // Apply custom background
          this.applyCustomBackground(e.target.result);
          break;
          
        default:
          console.warn(`Unknown custom drop area: ${areaId}`);
      }
    };
    
    reader.readAsDataURL(file);
  }
  
  /**
   * Apply a custom type image
   * @param {string} position - 'primary' or 'secondary'
   * @param {string} imageSrc - The image data URL
   */
  applyCustomImage(position, imageSrc) {
    const card = document.getElementById('card');
    
    if (position === 'primary') {
      // Apply primary type image directly to card background
      card.style.backgroundImage = `url('${imageSrc}')`;
      card.style.backgroundSize = 'contain';
      card.style.backgroundRepeat = 'no-repeat';
      card.style.backgroundPosition = 'center';
      
      // Remove type class
      card.className = '';
      
      // Show preview in the drop area
      const preview = this.primaryTypeDrop.querySelector('.type-preview');
      if (preview) {
        preview.innerHTML = '';
        const img = document.createElement('img');
        img.src = imageSrc;
        preview.appendChild(img);
      }
      
      // Save custom primary type
      const customTypes = {
        primary: imageSrc,
        secondary: window.customTypes?.secondary || null
      };
      
      window.customTypes = customTypes;
      saveState('customTypes', customTypes);
    } 
    else if (position === 'secondary') {
      // For secondary type, update or create second layer
      const secondLayer = document.getElementById('second-card-layer');
      
      if (secondLayer) {
        // Update existing layer
        secondLayer.style.backgroundImage = `url('${imageSrc}')`;
        secondLayer.style.backgroundSize = 'contain';
        secondLayer.style.backgroundRepeat = 'no-repeat';
        secondLayer.style.backgroundPosition = 'center';
      } 
      else {
        // Create a new second layer
        const newLayer = document.createElement('div');
        newLayer.id = 'second-card-layer';
        newLayer.style.position = 'absolute';
        newLayer.style.top = '0';
        newLayer.style.left = '0';
        newLayer.style.width = '100%';
        newLayer.style.height = '100%';
        newLayer.style.backgroundImage = `url('${imageSrc}')`;
        newLayer.style.backgroundSize = 'contain';
        newLayer.style.backgroundRepeat = 'no-repeat';
        newLayer.style.backgroundPosition = 'center';
        newLayer.style.zIndex = '1';
        newLayer.style.pointerEvents = 'none';
        
        card.appendChild(newLayer);
      }
      
      // Apply current mask if available
      if (window.currentMaskUrl) {
        this.applyMaskToSecondLayer(window.currentMaskUrl);
      }
      
      // Show preview in the drop area
      const preview = this.secondaryTypeDrop.querySelector('.type-preview');
      if (preview) {
        preview.innerHTML = '';
        const img = document.createElement('img');
        img.src = imageSrc;
        preview.appendChild(img);
      }
      
      // Save custom secondary type
      const customTypes = {
        primary: window.customTypes?.primary || null,
        secondary: imageSrc
      };
      
      window.customTypes = customTypes;
      saveState('customTypes', customTypes);
      
      // Ensure dual type is enabled
      const dualTypeToggle = document.getElementById('dual-type-toggle');
      if (dualTypeToggle && !dualTypeToggle.checked) {
        dualTypeToggle.checked = true;
        const event = new Event('change');
        dualTypeToggle.dispatchEvent(event);
      }
    }
  }
  
  /**
   * Apply a custom mask to the second layer
   * @param {string} maskSrc - The mask image data URL
   */
  applyCustomMask(maskSrc) {
    const secondLayer = document.getElementById('second-card-layer');
    if (!secondLayer) {
      console.warn('No second layer to apply mask to');
      return;
    }
    
    // Apply the mask
    secondLayer.style.maskImage = `url('${maskSrc}')`;
    secondLayer.style.webkitMaskImage = `url('${maskSrc}')`;
    secondLayer.style.maskSize = 'contain';
    secondLayer.style.webkitMaskSize = 'contain';
    secondLayer.style.maskRepeat = 'no-repeat';
    secondLayer.style.webkitMaskRepeat = 'no-repeat';
    secondLayer.style.maskPosition = 'center';
    secondLayer.style.webkitMaskPosition = 'center';
    
    // Remove any clip path
    secondLayer.style.clipPath = 'none';
    secondLayer.style.webkitClipPath = 'none';
    
    // Store the custom mask
    window.customMaskUrl = maskSrc;
    window.currentMaskUrl = maskSrc;
    
    // Update the mask selector if it exists
    const maskSelector = document.getElementById('mask-selector');
    if (maskSelector) {
      // Check if a custom option already exists
      let customOption = maskSelector.querySelector('option[value="custom"]');
      
      if (!customOption) {
        // Create a custom option
        customOption = document.createElement('option');
        customOption.value = 'custom';
        customOption.textContent = 'Custom Mask';
        maskSelector.appendChild(customOption);
      }
      
      // Select the custom option
      maskSelector.value = 'custom';
      
      // Trigger change event
      const event = new Event('change');
      maskSelector.dispatchEvent(event);
    }
    
    // Save the custom mask
    saveState('customMask', maskSrc);
  }
  
  /**
   * Apply a custom background
   * @param {string} bgSrc - The background image data URL
   */
  applyCustomBackground(bgSrc) {
    // Find or create a background layer
    let bgLayer = document.getElementById('custom-bg-layer');
    const card = document.getElementById('card');
    
    if (!bgLayer) {
      // Create a new background layer
      bgLayer = document.createElement('div');
      bgLayer.id = 'custom-bg-layer';
      bgLayer.style.position = 'absolute';
      bgLayer.style.top = '0';
      bgLayer.style.left = '0';
      bgLayer.style.width = '100%';
      bgLayer.style.height = '100%';
      bgLayer.style.zIndex = '0'; // Bottom layer
      
      card.appendChild(bgLayer);
    }
    
    // Set the background image
    bgLayer.style.backgroundImage = `url('${bgSrc}')`;
    bgLayer.style.backgroundSize = 'contain';
    bgLayer.style.backgroundRepeat = 'no-repeat';
    bgLayer.style.backgroundPosition = 'center';
    
    // Show preview in the drop area
    const customBgArea = document.getElementById('custom-bg');
    if (customBgArea) {
      customBgArea.innerHTML = '';
      customBgArea.style.backgroundImage = `url('${bgSrc}')`;
      customBgArea.style.backgroundSize = 'contain';
      customBgArea.style.backgroundRepeat = 'no-repeat';
      customBgArea.style.backgroundPosition = 'center';
      customBgArea.style.color = 'transparent';
    }
    
    // Save the custom background
    saveState('customBackground', bgSrc);
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
}

// Create and export a singleton instance
const dragDropManager = new DragDropManager();

export default dragDropManager;