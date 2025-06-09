/**
 * Enhanced Layer Manager - Provides improved layer management without breaking existing functionality
 */
class EnhancedLayerManager {
    constructor() {
      // Store references to existing elements
      this.cardElement = document.getElementById('card');
      this.layerListContainer = document.getElementById('layer-list');
      
      // Layer storage (will sync with existing functionality)
      this.layers = [];
      this.activeLayerId = null;
      
      // Initialize layer system
      this.initialize();
    }
    
    initialize() {
      console.log("Initializing Enhanced Layer Manager");
      
      // Create UI for layer management
      this.createLayerUI();
      
      // Sync with existing dual-type system
      this.syncWithExistingSystem();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initial render
      this.renderLayerList();
    }
    
    createLayerUI() {
      // Create layer list UI if it doesn't exist
      if (!this.layerListContainer) {
        const rightPanel = document.querySelector('.panel-right, .img-drop-container');
        if (rightPanel) {
          this.layerListContainer = document.createElement('div');
          this.layerListContainer.id = 'layer-list';
          this.layerListContainer.className = 'layer-list';
          
          const header = document.createElement('h3');
          header.textContent = 'Layers';
          
          rightPanel.appendChild(header);
          rightPanel.appendChild(this.layerListContainer);
        }
      }
    }
    
    syncWithExistingSystem() {
      // Initialize base layers from existing system
      this.layers = [];
      
      // Add Primary Type layer
      this.layers.push({
        id: 'primary_type',
        name: 'Primary Type',
        type: 'system',
        visible: true,
        locked: false,
        zIndex: 1
      });
      
      // Add Secondary Type layer if dual type is enabled
      const dualTypeEnabled = document.getElementById('dual-type-toggle')?.checked || false;
      
      if (dualTypeEnabled) {
        this.layers.push({
          id: 'secondary_type',
          name: 'Secondary Type',
          type: 'system',
          visible: true,
          locked: false,
          zIndex: 2
        });
      }
      
      // Add Text Content layer (always on top)
      this.layers.push({
        id: 'card_content',
        name: 'Card Content',
        type: 'content',
        visible: true,
        locked: true,
        zIndex: 100
      });
      
      // Look for existing additional layers
      const secondCardLayer = document.getElementById('second-card-layer');
      const customBgLayer = document.getElementById('custom-bg-layer');
      
      if (secondCardLayer && !dualTypeEnabled) {
        this.layers.push({
          id: 'custom_second_layer',
          name: 'Custom Secondary Layer',
          type: 'custom',
          visible: true,
          locked: false,
          zIndex: 2
        });
      }
      
      if (customBgLayer) {
        this.layers.push({
          id: 'custom_bg',
          name: 'Custom Background',
          type: 'custom',
          visible: true,
          locked: false,
          zIndex: 0
        });
      }
    }
    
    setupEventListeners() {
      // Add layer button
      const addLayerBtn = document.getElementById('add-layer-btn');
      if (addLayerBtn) {
        addLayerBtn.addEventListener('click', () => this.addImageLayer());
      } else {
        // Create the button if it doesn't exist
        this.createLayerButtons();
      }
      
      // Dual type toggle
      const dualTypeToggle = document.getElementById('dual-type-toggle');
      if (dualTypeToggle) {
        dualTypeToggle.addEventListener('change', () => {
          this.syncWithExistingSystem();
          this.renderLayerList();
        });
      }
      
      // Listen for clicks on layer items
      if (this.layerListContainer) {
        this.layerListContainer.addEventListener('click', (e) => {
          const layerItem = e.target.closest('.layer-item');
          if (!layerItem) return;
          
          const layerId = layerItem.dataset.layerId;
          
          if (e.target.closest('.layer-visibility')) {
            this.toggleLayerVisibility(layerId);
          } else if (e.target.closest('.layer-up')) {
            this.moveLayerUp(layerId);
          } else if (e.target.closest('.layer-down')) {
            this.moveLayerDown(layerId);
          } else if (e.target.closest('.layer-delete')) {
            this.deleteLayer(layerId);
          } else {
            this.selectLayer(layerId);
          }
        });
      }
    }
    
    createLayerButtons() {
      const container = this.layerListContainer?.parentNode;
      if (!container) return;
      
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'layer-buttons';
      
      const addButton = document.createElement('button');
      addButton.id = 'add-layer-btn';
      addButton.className = 'action-button';
      addButton.textContent = 'Add Image Layer';
      addButton.addEventListener('click', () => this.addImageLayer());
      
      buttonContainer.appendChild(addButton);
      container.appendChild(buttonContainer);
    }
    
    renderLayerList() {
      if (!this.layerListContainer) return;
      
      // Clear the list
      this.layerListContainer.innerHTML = '';
      
      // Sort layers by z-index (highest first for visual appearance)
      const sortedLayers = [...this.layers].sort((a, b) => b.zIndex - a.zIndex);
      
      // Create items for each layer
      sortedLayers.forEach(layer => {
        const layerItem = this.createLayerItem(layer);
        this.layerListContainer.appendChild(layerItem);
      });
    }
    
    createLayerItem(layer) {
      const item = document.createElement('div');
      item.className = 'layer-item';
      item.dataset.layerId = layer.id;
      
      if (layer.id === this.activeLayerId) {
        item.classList.add('active');
      }
      
      if (!layer.visible) {
        item.classList.add('hidden-layer');
      }
      
      if (layer.locked) {
        item.classList.add('locked');
      }
      
      // Layer icon & information
      const icon = document.createElement('div');
      icon.className = 'layer-icon';
      
      if (layer.type === 'system' && layer.id === 'primary_type') {
        const typeValue = window.currentType || 'normal';
        icon.innerHTML = `<img src="img/${typeValue}.png" alt="${typeValue}">`;
      } else if (layer.type === 'system' && layer.id === 'secondary_type') {
        const typeValue = window.secondType || 'normal';
        icon.innerHTML = `<img src="img/${typeValue}.png" alt="${typeValue}">`;
      } else if (layer.type === 'content') {
        icon.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3,3H21V5H3V3M3,7H21V9H3V7M3,11H21V13H3V11M3,15H21V17H3V15M3,19H21V21H3V19Z"/></svg>';
      } else {
        icon.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z"/></svg>';
      }
      
      const info = document.createElement('div');
      info.className = 'layer-info';
      
      const name = document.createElement('div');
      name.className = 'layer-name';
      name.textContent = layer.name;
      
      const type = document.createElement('div');
      type.className = 'layer-type';
      type.textContent = layer.type;
      
      info.appendChild(name);
      info.appendChild(type);
      
      // Controls
      const controls = document.createElement('div');
      controls.className = 'layer-controls';
      
      const visibilityBtn = document.createElement('button');
      visibilityBtn.className = 'layer-visibility';
      visibilityBtn.title = layer.visible ? 'Hide Layer' : 'Show Layer';
      visibilityBtn.innerHTML = layer.visible ? 
        '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" /></svg>' :
        '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z" /></svg>';
      
      // Only add up/down/delete controls for non-locked layers
      if (!layer.locked) {
        const upBtn = document.createElement('button');
        upBtn.className = 'layer-up';
        upBtn.title = 'Move Up';
        upBtn.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" /></svg>';
        
        const downBtn = document.createElement('button');
        downBtn.className = 'layer-down';
        downBtn.title = 'Move Down';
        downBtn.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" /></svg>';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'layer-delete';
        deleteBtn.title = 'Delete Layer';
        deleteBtn.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>';
        
        controls.appendChild(upBtn);
        controls.appendChild(downBtn);
        controls.appendChild(deleteBtn);
      }
      
      controls.appendChild(visibilityBtn);
      
      // Assemble item
      item.appendChild(icon);
      item.appendChild(info);
      item.appendChild(controls);
      
      return item;
    }
    
    selectLayer(layerId) {
      const layer = this.layers.find(l => l.id === layerId);
      if (!layer) return;
      
      this.activeLayerId = layerId;
      
      // Update UI
      const layerItems = this.layerListContainer.querySelectorAll('.layer-item');
      layerItems.forEach(item => {
        item.classList.toggle('active', item.dataset.layerId === layerId);
      });
      
      // Show properties for the selected layer
      this.showLayerProperties(layer);
      
      // Dispatch event for other components
      const event = new CustomEvent('layerSelected', {
        detail: { layerId, layer }
      });
      document.dispatchEvent(event);
    }
    
    toggleLayerVisibility(layerId) {
      const layer = this.layers.find(l => l.id === layerId);
      if (!layer) return;
      
      layer.visible = !layer.visible;
      
      // Update UI
      this.renderLayerList();
      
      // Apply to actual card layers
      this.applyLayerChanges(layer);
    }
    
    moveLayerUp(layerId) {
      const index = this.layers.findIndex(l => l.id === layerId);
      if (index <= 0) return;
      
      // Find the layer with the next lower z-index
      const currentZ = this.layers[index].zIndex;
      let targetIndex = -1;
      let targetZ = -1;
      
      for (let i = 0; i < this.layers.length; i++) {
        if (i !== index && this.layers[i].zIndex < currentZ && (targetZ === -1 || this.layers[i].zIndex > targetZ)) {
          targetIndex = i;
          targetZ = this.layers[i].zIndex;
        }
      }
      
      if (targetIndex !== -1) {
        // Swap z-indices
        const tempZ = this.layers[index].zIndex;
        this.layers[index].zIndex = this.layers[targetIndex].zIndex;
        this.layers[targetIndex].zIndex = tempZ;
        
        // Update UI
        this.renderLayerList();
        
        // Apply changes
        this.applyLayerChanges(this.layers[index]);
        this.applyLayerChanges(this.layers[targetIndex]);
      }
    }
    
    moveLayerDown(layerId) {
      const index = this.layers.findIndex(l => l.id === layerId);
      if (index === -1 || index >= this.layers.length - 1) return;
      
      // Find the layer with the next higher z-index
      const currentZ = this.layers[index].zIndex;
      let targetIndex = -1;
      let targetZ = -1;
      
      for (let i = 0; i < this.layers.length; i++) {
        if (i !== index && this.layers[i].zIndex > currentZ && (targetZ === -1 || this.layers[i].zIndex < targetZ)) {
          targetIndex = i;
          targetZ = this.layers[i].zIndex;
        }
      }
      
      if (targetIndex !== -1) {
        // Swap z-indices
        const tempZ = this.layers[index].zIndex;
        this.layers[index].zIndex = this.layers[targetIndex].zIndex;
        this.layers[targetIndex].zIndex = tempZ;
        
        // Update UI
        this.renderLayerList();
        
        // Apply changes
        this.applyLayerChanges(this.layers[index]);
        this.applyLayerChanges(this.layers[targetIndex]);
      }
    }
    
    deleteLayer(layerId) {
      const index = this.layers.findIndex(l => l.id === layerId);
      if (index === -1) return;
      
      const layer = this.layers[index];
      
      // Don't delete system layers
      if (layer.type === 'system' || layer.type === 'content') {
        alert("System layers cannot be deleted.");
        return;
      }
      
      // Confirm deletion
      if (!confirm(`Are you sure you want to delete the layer "${layer.name}"?`)) {
        return;
      }
      
      // Remove the actual DOM element
      if (layer.id === 'custom_bg') {
        const bgLayer = document.getElementById('custom-bg-layer');
        if (bgLayer) bgLayer.remove();
      } else {
        const layerElement = document.getElementById(layer.id);
        if (layerElement) layerElement.remove();
      }
      
      // Remove from array
      this.layers.splice(index, 1);
      
      // Update UI
      this.renderLayerList();
      
      // Clear selection if the deleted layer was selected
      if (this.activeLayerId === layerId) {
        this.activeLayerId = null;
        
        // Show properties for a default layer
        if (this.layers.length > 0) {
          this.selectLayer(this.layers[0].id);
        } else {
          this.showLayerProperties(null);
        }
      }
    }
    
    addImageLayer() {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          
          reader.onload = (event) => {
            const layerId = `custom_image_${Date.now()}`;
            const layerName = file.name.split('.')[0] || 'Custom Image';
            
            // Create layer object
            const newLayer = {
              id: layerId,
              name: layerName,
              type: 'image',
              visible: true,
              locked: false,
              zIndex: this.getNextZIndex(),
              src: event.target.result,
              opacity: 1,
              blendMode: 'normal',
              mask: '',
              x: 0,
              y: 0,
              width: 100,
              height: 100
            };
            
            // Add to array
            this.layers.push(newLayer);
            
            // Create DOM element
            this.createImageLayer(newLayer);
            
            // Update UI
            this.renderLayerList();
            
            // Select the new layer
            this.selectLayer(layerId);
          };
          
          reader.readAsDataURL(file);
        }
        
        document.body.removeChild(fileInput);
      });
      
      document.body.appendChild(fileInput);
      fileInput.click();
    }
    
    createImageLayer(layer) {
      // Create a new div for the image layer
      const layerElement = document.createElement('div');
      layerElement.id = layer.id;
      layerElement.className = 'layer-element';
      layerElement.style.position = 'absolute';
      layerElement.style.top = `${layer.y}%`;
      layerElement.style.left = `${layer.x}%`;
      layerElement.style.width = `${layer.width}%`;
      layerElement.style.height = `${layer.height}%`;
      layerElement.style.zIndex = layer.zIndex;
      layerElement.style.opacity = layer.opacity;
      layerElement.style.mixBlendMode = layer.blendMode;
      layerElement.style.pointerEvents = 'none';
      
      // Create image
      const img = document.createElement('img');
      img.src = layer.src;
      img.alt = layer.name;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      
      layerElement.appendChild(img);
      
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
    }
    
    showLayerProperties(layer) {
      const propertiesContainer = document.getElementById('layer-properties');
      if (!propertiesContainer) return;
      
      // Clear the container
      propertiesContainer.innerHTML = '';
      
      if (!layer) {
        propertiesContainer.innerHTML = '<p>No layer selected</p>';
        return;
      }
      
      // Create properties UI based on layer type
      if (layer.type === 'image') {
        this.showImageLayerProperties(layer, propertiesContainer);
      } else if (layer.type === 'system' && layer.id === 'primary_type') {
        this.showPrimaryTypeProperties(layer, propertiesContainer);
      } else if (layer.type === 'system' && layer.id === 'secondary_type') {
        this.showSecondaryTypeProperties(layer, propertiesContainer);
      } else if (layer.type === 'content') {
        this.showContentLayerProperties(layer, propertiesContainer);
      } else {
        propertiesContainer.innerHTML = `
          <h4>${layer.name}</h4>
          <p>Type: ${layer.type}</p>
          <p>Z-Index: ${layer.zIndex}</p>
        `;
      }
    }
    
    showImageLayerProperties(layer, container) {
      container.innerHTML = `
        <h4>Image Layer Properties</h4>
        <div class="property-group">
          <label for="layer-name">Name:</label>
          <input type="text" id="layer-name" value="${layer.name}" data-property="name">
        </div>
        <div class="property-group">
          <label for="layer-opacity">Opacity:</label>
          <input type="range" id="layer-opacity" min="0" max="100" value="${layer.opacity * 100}" data-property="opacity">
          <span class="value-display">${Math.round(layer.opacity * 100)}%</span>
        </div>
        <div class="property-group">
          <label for="layer-blend-mode">Blend Mode:</label>
          <select id="layer-blend-mode" data-property="blendMode">
            <option value="normal" ${layer.blendMode === 'normal' ? 'selected' : ''}>Normal</option>
            <option value="multiply" ${layer.blendMode === 'multiply' ? 'selected' : ''}>Multiply</option>
            <option value="screen" ${layer.blendMode === 'screen' ? 'selected' : ''}>Screen</option>
            <option value="overlay" ${layer.blendMode === 'overlay' ? 'selected' : ''}>Overlay</option>
            <option value="darken" ${layer.blendMode === 'darken' ? 'selected' : ''}>Darken</option>
            <option value="lighten" ${layer.blendMode === 'lighten' ? 'selected' : ''}>Lighten</option>
            <option value="color-dodge" ${layer.blendMode === 'color-dodge' ? 'selected' : ''}>Color Dodge</option>
            <option value="color-burn" ${layer.blendMode === 'color-burn' ? 'selected' : ''}>Color Burn</option>
            <option value="hard-light" ${layer.blendMode === 'hard-light' ? 'selected' : ''}>Hard Light</option>
            <option value="soft-light" ${layer.blendMode === 'soft-light' ? 'selected' : ''}>Soft Light</option>
            <option value="difference" ${layer.blendMode === 'difference' ? 'selected' : ''}>Difference</option>
            <option value="exclusion" ${layer.blendMode === 'exclusion' ? 'selected' : ''}>Exclusion</option>
          </select>
        </div>
        <div class="property-group">
          <label for="layer-mask">Mask:</label>
          <select id="layer-mask" data-property="mask">
            <option value="" ${!layer.mask ? 'selected' : ''}>None</option>
            <option value="img/mask.png" ${layer.mask === 'img/mask.png' ? 'selected' : ''}>Default Mask</option>
            <option value="img/masks/horizontal-split.png" ${layer.mask === 'img/masks/horizontal-split.png' ? 'selected' : ''}>Horizontal Split</option>
            <option value="img/masks/vertical-split.png" ${layer.mask === 'img/masks/vertical-split.png' ? 'selected' : ''}>Vertical Split</option>
            <option value="img/masks/gradient-fade.png" ${layer.mask === 'img/masks/gradient-fade.png' ? 'selected' : ''}>Gradient Fade</option>
            <option value="img/masks/circle-center.png" ${layer.mask === 'img/masks/circle-center.png' ? 'selected' : ''}>Circle Center</option>
          </select>
        </div>
        <div class="property-group">
          <label>Position:</label>
          <div class="position-inputs">
            <div>
              <label for="layer-x">X:</label>
              <input type="number" id="layer-x" value="${layer.x}" data-property="x">
            </div>
            <div>
              <label for="layer-y">Y:</label>
              <input type="number" id="layer-y" value="${layer.y}" data-property="y">
            </div>
          </div>
        </div>
        <div class="property-group">
          <label>Size:</label>
          <div class="size-inputs">
            <div>
              <label for="layer-width">W:</label>
              <input type="number" id="layer-width" value="${layer.width}" data-property="width">
            </div>
            <div>
              <label for="layer-height">H:</label>
              <input type="number" id="layer-height" value="${layer.height}" data-property="height">
            </div>
          </div>
        </div>
        <div class="property-group">
          <label>Replace Image:</label>
          <button id="replace-image-btn" class="action-button">Upload New Image</button>
        </div>
      `;
      
      // Set up event listeners
      container.querySelectorAll('input, select').forEach(input => {
        const property = input.dataset.property;
        if (!property) return;
        
        input.addEventListener('input', (e) => {
          let value = e.target.value;
          
          // Convert values
          if (property === 'opacity') {
            value = parseFloat(value) / 100;
            const display = container.querySelector('.value-display');
            if (display) display.textContent = `${Math.round(value * 100)}%`;
          } else if (['x', 'y', 'width', 'height'].includes(property)) {
            value = parseFloat(value);
          }
          
          // Update layer
          layer[property] = value;
          
          // Apply changes
          this.applyLayerChanges(layer);
        });
      });
      
      // Replace image button
      const replaceBtn = container.querySelector('#replace-image-btn');
      if (replaceBtn) {
        replaceBtn.addEventListener('click', () => {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.style.display = 'none';
          
          fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              const reader = new FileReader();
              
              reader.onload = (event) => {
                // Update layer
                layer.src = event.target.result;
                
                // Apply changes
                this.applyLayerChanges(layer);
              };
              
              reader.readAsDataURL(file);
            }
            
            document.body.removeChild(fileInput);
          });
          
          document.body.appendChild(fileInput);
          fileInput.click();
        });
      }
    }
    
    showPrimaryTypeProperties(layer, container) {
      // Get current type
      const currentType = window.currentType || 'normal';
      const currentSet = window.currentSet || 'Classic';
      
      container.innerHTML = `
        <h4>Primary Type</h4>
        <div class="property-group">
          <label>Current Type:</label>
          <div class="type-display">${currentType}</div>
        </div>
        <div class="property-group">
          <label>Card Set:</label>
          <div class="set-display">${currentSet}</div>
        </div>
        <p>Use the Type selector under the card to change the primary type.</p>
      `;
    }
    
    showSecondaryTypeProperties(layer, container) {
      // Get current values
      const secondType = window.secondType || '';
      const dualTypeSet = window.dualTypeSet || 'Classic';
      const currentMask = window.currentMaskUrl || '';
      const blendMode = document.querySelector('#second-card-layer')?.style?.mixBlendMode || 'normal';
      
      container.innerHTML = `
        <h4>Secondary Type</h4>
        <div class="property-group">
          <label>Current Type:</label>
          <div class="type-display">${secondType}</div>
        </div>
        <div class="property-group">
          <label>Card Set:</label>
          <select id="dual-card-set-prop">
            <option value="Classic" ${dualTypeSet === 'Classic' ? 'selected' : ''}>Original Set</option>
            <option value="QuantumContour" ${dualTypeSet === 'QuantumContour' ? 'selected' : ''}>Quantum Contour</option>
          </select>
        </div>
        <div class="property-group">
          <label for="mask-selector-prop">Mask:</label>
          <select id="mask-selector-prop">
            <option value="" ${!currentMask ? 'selected' : ''}>Default Split (Diagonal)</option>
            <option value="img/mask.png" ${currentMask === 'img/mask.png' ? 'selected' : ''}>Standard Mask</option>
            <option value="img/masks/horizontal-split.png" ${currentMask === 'img/masks/horizontal-split.png' ? 'selected' : ''}>Horizontal Split</option>
            <option value="img/masks/vertical-split.png" ${currentMask === 'img/masks/vertical-split.png' ? 'selected' : ''}>Vertical Split</option>
            <option value="img/masks/gradient-fade.png" ${currentMask === 'img/masks/gradient-fade.png' ? 'selected' : ''}>Gradient Fade</option>
            <option value="img/masks/circle-center.png" ${currentMask === 'img/masks/circle-center.png' ? 'selected' : ''}>Circle Center</option>
          </select>
        </div>
        <div class="property-group">
          <label for="blend-mode-selector-prop">Blend Mode:</label>
          <select id="blend-mode-selector-prop">
            <option value="normal" ${blendMode === 'normal' ? 'selected' : ''}>Normal</option>
            <option value="multiply" ${blendMode === 'multiply' ? 'selected' : ''}>Multiply</option>
            <option value="screen" ${blendMode === 'screen' ? 'selected' : ''}>Screen</option>
            <option value="overlay" ${blendMode === 'overlay' ? 'selected' : ''}>Overlay</option>
            <option value="darken" ${blendMode === 'darken' ? 'selected' : ''}>Darken</option>
            <option value="lighten" ${blendMode === 'lighten' ? 'selected' : ''}>Lighten</option>
            <option value="color-dodge" ${blendMode === 'color-dodge' ? 'selected' : ''}>Color Dodge</option>
            <option value="color-burn" ${blendMode === 'color-burn' ? 'selected' : ''}>Color Burn</option>
            <option value="hard-light" ${blendMode === 'hard-light' ? 'selected' : ''}>Hard Light</option>
            <option value="soft-light" ${blendMode === 'soft-light' ? 'selected' : ''}>Soft Light</option>
            <option value="difference" ${blendMode === 'difference' ? 'selected' : ''}>Difference</option>
            <option value="exclusion" ${blendMode === 'exclusion' ? 'selected' : ''}>Exclusion</option>
          </select>
        </div>
      `;
      
      // Set up dual card set selector
      const setSelector = container.querySelector('#dual-card-set-prop');
      if (setSelector) {
        setSelector.addEventListener('change', (e) => {
          window.dualTypeSet = e.target.value;
          
          if (window.dualTypeSimple && typeof window.dualTypeSimple.updateSecondLayer === 'function') {
            window.dualTypeSimple.updateSecondLayer();
          }
        });
      }
      
      // Set up mask selector
      const maskSelector = container.querySelector('#mask-selector-prop');
      if (maskSelector) {
        maskSelector.addEventListener('change', (e) => {
          const maskUrl = e.target.value;
          window.currentMaskUrl = maskUrl;
          
          if (window.dualTypeSimple && typeof window.dualTypeSimple.updateMaskOnLayer === 'function') {
            window.dualTypeSimple.updateMaskOnLayer();
          }
        });
      }
      
      // Set up blend mode selector
      const blendModeSelector = container.querySelector('#blend-mode-selector-prop');
      if (blendModeSelector) {
        blendModeSelector.addEventListener('change', (e) => {
          const blendMode = e.target.value;
          const secondLayer = document.getElementById('second-card-layer');
          
          if (secondLayer) {
            secondLayer.style.mixBlendMode = blendMode;
          }
        });
      }
    }
    
    showContentLayerProperties(layer, container) {
      container.innerHTML = `
        <h4>Content Layer</h4>
        <p>This layer contains the card text and information.</p>
        <p>Z-Index: ${layer.zIndex}</p>
      `;
    }
    
    applyLayerChanges(layer) {
      if (!layer) return;
      
      if (layer.type === 'image') {
        // Update image layer
        const layerElement = document.getElementById(layer.id);
        
        if (!layerElement) {
          // Create it if it doesn't exist
          this.createImageLayer(layer);
          return;
        }
        
        // Update properties
        layerElement.style.opacity = layer.visible ? layer.opacity : 0;
        layerElement.style.mixBlendMode = layer.blendMode;
        layerElement.style.zIndex = layer.zIndex;
        layerElement.style.top = `${layer.y}%`;
        layerElement.style.left = `${layer.x}%`;
        layerElement.style.width = `${layer.width}%`;
        layerElement.style.height = `${layer.height}%`;
        
        // Update image
        const img = layerElement.querySelector('img');
        if (img && img.src !== layer.src) {
          img.src = layer.src;
        }
        
        // Apply mask
        if (layer.mask) {
          layerElement.style.maskImage = `url(${layer.mask})`;
          layerElement.style.webkitMaskImage = `url(${layer.mask})`;
          layerElement.style.maskSize = 'contain';
          layerElement.style.webkitMaskSize = 'contain';
          layerElement.style.maskRepeat = 'no-repeat';
          layerElement.style.webkitMaskRepeat = 'no-repeat';
          layerElement.style.maskPosition = 'center';
          layerElement.style.webkitMaskPosition = 'center';
        } else {
          layerElement.style.maskImage = 'none';
          layerElement.style.webkitMaskImage = 'none';
        }
      } else if (layer.id === 'primary_type') {
        // Primary type visibility (no other changes here, use existing selectors)
        if (!layer.visible) {
          this.cardElement.style.visibility = 'hidden';
        } else {
          this.cardElement.style.visibility = 'visible';
        }
      } else if (layer.id === 'secondary_type') {
        // Secondary type
        const secondLayer = document.getElementById('second-card-layer');
        
        if (secondLayer) {
          secondLayer.style.display = layer.visible ? 'block' : 'none';
          secondLayer.style.zIndex = layer.zIndex;
        }
      } else if (layer.id === 'card_content') {
        // Card content
        const cardContainer = this.cardElement.querySelector('.card-container');
        
        if (cardContainer) {
          cardContainer.style.display = layer.visible ? 'block' : 'none';
          cardContainer.style.zIndex = layer.zIndex;
        }
      }
    }
    
    getNextZIndex() {
      // Find max z-index and add 1
      let maxZ = 0;
      this.layers.forEach(layer => {
        if (layer.zIndex > maxZ) {
          maxZ = layer.zIndex;
        }
      });
      
      return maxZ + 1;
    }
  }
  
  // Create instance
  const enhancedLayerManager = new EnhancedLayerManager();