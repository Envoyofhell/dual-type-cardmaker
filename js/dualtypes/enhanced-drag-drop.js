/**
 * Enhanced Drag & Drop - Extends existing drag & drop functionality with layer support
 */
class EnhancedDragDrop {
    constructor() {
      // Find existing drop areas
      this.mainImageDrop = document.querySelector('.img-drop');
      this.prevoImageDrop = document.querySelector('.img-drop-small');
      this.customDropAreas = document.querySelectorAll('.custom-drop-area');
      
      // Initialize
      this.initialize();
    }
    
    initialize() {
      console.log("Initializing Enhanced Drag & Drop");
      
      // Check if we already have the original drop events set up
      const existingDragDrop = !!window._dragDropInitialized;
      
      // Enhance custom drop areas
      this.setupCustomDropAreas();
      
      // Add layer drop zone
      this.createLayerDropZone();
      
      // Set up drop events for type areas
      this.setupTypeDropEvents();
      
      // Mark as initialized
      window._dragDropInitialized = true;
    }
    
    setupCustomDropAreas() {
      // Set up events for existing custom areas
      this.customDropAreas.forEach(area => {
        this.setupCustomArea(area);
      });
    }
    
    setupCustomArea(area) {
      // Make sure we don't double-bind events
      if (area._enhanced) return;
      
      area._enhanced = true;
      
      // Enhancement: Enable clicking on drop zone
      area.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            this.processCustomFile(area.id, e.target.files[0]);
          }
          document.body.removeChild(fileInput);
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
      });
    }
    
    createLayerDropZone() {
      const container = document.querySelector('.img-drop-container');
      if (!container) return;
      
      // Check if already exists
      if (document.getElementById('layer-drop-zone')) return;
      
      // Create drop zone for new layers
      const layerDropZone = document.createElement('div');
      layerDropZone.id = 'layer-drop-zone';
      layerDropZone.className = 'custom-drop-area';
      layerDropZone.textContent = 'Drop image here to add a new layer';
      
      // Set up drop events
      layerDropZone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        layerDropZone.classList.add('active');
      });
      
      layerDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        layerDropZone.classList.remove('active');
      });
      
      layerDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
      
      layerDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        layerDropZone.classList.remove('active');
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleLayerDrop(e.dataTransfer.files[0]);
        }
      });
      
      // Add click event too
      this.setupCustomArea(layerDropZone);
      
      // Add to container
      container.appendChild(layerDropZone);
    }
    
    setupTypeDropEvents() {
      // Find or create type drop zones
      const typeContainer = document.querySelector('.img-drop-container');
      if (!typeContainer) return;
      
      // Check if already exists
      if (document.getElementById('primary-type-drop')) return;
      
      // Create primary and secondary type drop zones
      const primaryTypeDrop = document.createElement('div');
      primaryTypeDrop.id = 'primary-type-drop';
      primaryTypeDrop.className = 'type-drop-area';
      primaryTypeDrop.innerHTML = `
        <div class="type-drop-label">Primary Type</div>
        <div class="type-preview"></div>
      `;
      
      const secondaryTypeDrop = document.createElement('div');
      secondaryTypeDrop.id = 'secondary-type-drop';
      secondaryTypeDrop.className = 'type-drop-area';
      secondaryTypeDrop.innerHTML = `
        <div class="type-drop-label">Secondary Type</div>
        <div class="type-preview"></div>
      `;
      
      // Style the drop zones
      const style = document.createElement('style');
      style.textContent = `
        .type-drop-area {
          width: 100px;
          height: 100px;
          background-color: rgba(0, 0, 0, 0.1);
          border: 2px dashed white;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .type-drop-area:hover {
          background-color: rgba(0, 0, 0, 0.2);
          border-color: #fdcb00;
        }
        
        .type-drop-area.dragover {
          background-color: rgba(255, 255, 255, 0.2);
          border-color: #fdcb00;
        }
        
        .type-drop-label {
          font-size: 14px;
          color: white;
          margin-bottom: 5px;
        }
        
        .type-preview {
          width: 40px;
          height: 40px;
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .type-preview img {
          width: 80%;
          height: 80%;
        }
        
        .type-drop-container {
          display: flex;
          justify-content: center;
          margin-top: 15px;
        }
      `;
      
      document.head.appendChild(style);
      
      // Create container
      const typeDropContainer = document.createElement('div');
      typeDropContainer.className = 'type-drop-container';
      typeDropContainer.appendChild(primaryTypeDrop);
      typeDropContainer.appendChild(secondaryTypeDrop);
      
      // Add to main container
      typeContainer.appendChild(typeDropContainer);
      
      // Set up events
      this.setupTypeDropZone(primaryTypeDrop, 'primary');
      this.setupTypeDropZone(secondaryTypeDrop, 'secondary');
      
      // Initialize previews
      this.updateTypePreview('primary', window.currentType);
      this.updateTypePreview('secondary', window.secondType);
    }
    
    setupTypeDropZone(element, position) {
      // Drop events
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
        
        try {
          // Check if it's a type being dropped (from type selector)
          if (e.dataTransfer.getData('text')) {
            const data = JSON.parse(e.dataTransfer.getData('text'));
            
            if (data && data.type === 'pokemon-type') {
              this.updateTypePreview(position, data.value);
              this.applyTypeChange(position, data.value);
            }
          }
        } catch (err) {
          console.error('Error processing drop:', err);
        }
      });
      
      // Click to select from popup
      element.addEventListener('click', () => {
        this.showTypeSelector(position);
      });
    }
    
    updateTypePreview(position, typeValue) {
      if (!typeValue) return;
      
      const previewElement = document.querySelector(`#${position}-type-drop .type-preview`);
      if (!previewElement) return;
      
      // Clear current preview
      previewElement.innerHTML = '';
      
      // Add type icon
      const img = document.createElement('img');
      img.src = `img/${typeValue}.png`;
      img.alt = typeValue;
      previewElement.appendChild(img);
    }
    
    applyTypeChange(position, typeValue) {
      if (position === 'primary') {
        // Find and click the corresponding type in the original selector
        const typeElement = document.querySelector(`.select-type[value="${typeValue}"]`);
        if (typeElement) {
          typeElement.click();
        }
      } else if (position === 'secondary') {
        // Find and click the corresponding secondary type
        const typeElement = document.querySelector(`.select-second-type[value="${typeValue}"]`);
        if (typeElement) {
          typeElement.click();
        }
        
        // Enable dual type if not already enabled
        const dualTypeToggle = document.getElementById('dual-type-toggle');
        if (dualTypeToggle && !dualTypeToggle.checked) {
          dualTypeToggle.checked = true;
          
          // Trigger change event
          const event = new Event('change');
          dualTypeToggle.dispatchEvent(event);
        }
      }
    }
    
    showTypeSelector(position) {
      // Create a popup with all type options
      const popup = document.createElement('div');
      popup.className = 'type-selector-popup';
      
      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        .type-selector-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(0, 0, 0, 0.9);
          border: 2px solid white;
          border-radius: 10px;
          padding: 20px;
          z-index: 1000;
          max-width: 400px;
        }
        
        .type-selector-popup h3 {
          color: white;
          margin-top: 0;
          text-align: center;
        }
        
        .type-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        
        .type-grid-item {
          width: 60px;
          height: 60px;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .type-grid-item:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
        
        .type-grid-item img {
          width: 70%;
          height: 70%;
        }
        
        .type-selector-close {
          position: absolute;
          top: 10px;
          right: 10px;
          color: white;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }
      `;
      
      document.head.appendChild(style);
      
      // Add title
      const title = document.createElement('h3');
      title.textContent = position === 'primary' ? 'Select Primary Type' : 'Select Secondary Type';
      popup.appendChild(title);
      
      // Add close button
      const closeButton = document.createElement('button');
      closeButton.className = 'type-selector-close';
      closeButton.textContent = '×';
      closeButton.addEventListener('click', () => {
        document.body.removeChild(popup);
      });
      popup.appendChild(closeButton);
      
      // Create type grid
      const typeGrid = document.createElement('div');
      typeGrid.className = 'type-grid';
      
      // Add type options
      const types = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
      
      types.forEach(type => {
        const typeItem = document.createElement('div');
        typeItem.className = 'type-grid-item';
        typeItem.dataset.type = type;
        
        const img = document.createElement('img');
        img.src = `img/${type}.png`;
        img.alt = type;
        typeItem.appendChild(img);
        
        typeItem.addEventListener('click', () => {
          this.updateTypePreview(position, type);
          this.applyTypeChange(position, type);
          document.body.removeChild(popup);
        });
        
        typeGrid.appendChild(typeItem);
      });
      
      popup.appendChild(typeGrid);
      
      // Add to body
      document.body.appendChild(popup);
      
      // Close when clicking outside
      popup.addEventListener('click', (e) => {
        if (e.target === popup) {
          document.body.removeChild(popup);
        }
      });
    }
    
    processCustomFile(areaId, file) {
      if (!file.type.startsWith('image/')) {
        console.warn("Not an image file");
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const imageData = e.target.result;
        
        switch (areaId) {
          case 'custom-primary':
            this.applyCustomImage('primary', imageData);
            break;
            
          case 'custom-secondary':
            this.applyCustomImage('secondary', imageData);
            break;
            
          case 'custom-mask':
            this.applyCustomMask(imageData);
            break;
            
          case 'custom-bg':
            this.applyCustomBackground(imageData);
            break;
            
          case 'layer-drop-zone':
            this.handleLayerDrop(file);
            break;
            
          default:
            console.warn(`Unknown drop area: ${areaId}`);
        }
      };
      
      reader.readAsDataURL(file);
    }
    
    applyCustomImage(position, imageData) {
      // Use existing functionality
      if (typeof window.applyCustomImage === 'function') {
        window.applyCustomImage(position, imageData);
      } else {
        const card = document.getElementById('card');
        
        if (position === 'primary') {
          card.style.backgroundImage = `url(${imageData})`;
          card.style.backgroundSize = 'contain';
          card.style.backgroundRepeat = 'no-repeat';
          card.style.backgroundPosition = 'center';
          card.className = '';
        } else if (position === 'secondary') {
          // Handle secondary type image
          const secondLayer = document.getElementById('second-card-layer');
          
          if (secondLayer) {
            secondLayer.style.backgroundImage = `url(${imageData})`;
            secondLayer.style.backgroundSize = 'contain';
            secondLayer.style.backgroundRepeat = 'no-repeat';
            secondLayer.style.backgroundPosition = 'center';
          } else {
            // Create a new second layer
            const newLayer = document.createElement('div');
            newLayer.id = 'second-card-layer';
            newLayer.style.position = 'absolute';
            newLayer.style.top = '0';
            newLayer.style.left = '0';
            newLayer.style.width = '100%';
            newLayer.style.height = '100%';
            newLayer.style.backgroundImage = `url(${imageData})`;
            newLayer.style.backgroundSize = 'contain';
            newLayer.style.backgroundRepeat = 'no-repeat';
            newLayer.style.backgroundPosition = 'center';
            newLayer.style.zIndex = '1';
            
            card.appendChild(newLayer);
          }
          
          // Enable dual type if not already enabled
          const dualTypeToggle = document.getElementById('dual-type-toggle');
          if (dualTypeToggle && !dualTypeToggle.checked) {
            dualTypeToggle.checked = true;
            
            // Trigger change event
            const event = new Event('change');
            dualTypeToggle.dispatchEvent(event);
          }
        }
      }
    }
    
    applyCustomMask(imageData) {
      // Use existing functionality
      if (typeof window.applyCustomMask === 'function') {
        window.applyCustomMask(imageData);
      } else {
        const secondLayer = document.getElementById('second-card-layer');
        if (!secondLayer) return;
        
        secondLayer.style.maskImage = `url(${imageData})`;
        secondLayer.style.webkitMaskImage = `url(${imageData})`;
        secondLayer.style.maskSize = 'contain';
        secondLayer.style.webkitMaskSize = 'contain';
        secondLayer.style.maskRepeat = 'no-repeat';
        secondLayer.style.webkitMaskRepeat = 'no-repeat';
        secondLayer.style.maskPosition = 'center';
        secondLayer.style.webkitMaskPosition = 'center';
        
        secondLayer.style.clipPath = 'none';
        secondLayer.style.webkitClipPath = 'none';
        
        // Store the custom mask
        window.customMaskUrl = imageData;
        window.currentMaskUrl = imageData;
      }
    }
    
    applyCustomBackground(imageData) {
      // Use existing functionality
      if (typeof window.applyCustomBackground === 'function') {
        window.applyCustomBackground(imageData);
      } else {
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
        bgLayer.style.backgroundImage = `url(${imageData})`;
        bgLayer.style.backgroundSize = 'contain';
        bgLayer.style.backgroundRepeat = 'no-repeat';
        bgLayer.style.backgroundPosition = 'center';
      }
    }
    
    handleLayerDrop(file) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        // Create a layer if enhancedLayerManager exists
        if (window.enhancedLayerManager) {
          const layerId = `custom_image_${Date.now()}`;
          const layerName = file.name.split('.')[0] || 'Custom Image';
          
          // Create layer object
          const newLayer = {
            id: layerId,
            name: layerName,
            type: 'image',
            visible: true,
            locked: false,
            zIndex: window.enhancedLayerManager.getNextZIndex(),
            src: e.target.result,
            opacity: 1,
            blendMode: 'normal',
            mask: '',
            x: 0,
            y: 0,
            width: 100,
            height: 100
          };
          
          // Add the layer
          window.enhancedLayerManager.layers.push(newLayer);
          window.enhancedLayerManager.createImageLayer(newLayer);
          window.enhancedLayerManager.renderLayerList();
          window.enhancedLayerManager.selectLayer(layerId);
        } else {
          // Fallback to simpler layer method
          this.createSimpleLayer(e.target.result, file.name.split('.')[0]);
        }
      };
      
      reader.readAsDataURL(file);
    }
    
    createSimpleLayer(imageData, name) {
      const card = document.getElementById('card');
      if (!card) return;
      
      // Generate a unique ID
      const layerId = `layer_${Date.now()}`;
      
      // Create layer element
      const layer = document.createElement('div');
      layer.id = layerId;
      layer.className = 'custom-layer';
      layer.style.position = 'absolute';
      layer.style.top = '0';
      layer.style.left = '0';
      layer.style.width = '100%';
      layer.style.height = '100%';
      layer.style.zIndex = '10'; // Above background but below content
      
      // Create image
      const img = document.createElement('img');
      img.src = imageData;
      img.alt = name || 'Custom Layer';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      
      layer.appendChild(img);
      card.appendChild(layer);
    }
  }
  
  // Create instance
  const enhancedDragDrop = new EnhancedDragDrop();