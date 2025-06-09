/**
 * Enhanced Download Manager - Improves card download with proper layer compositing
 */
class EnhancedDownloadManager {
    constructor() {
      this.cardElement = document.getElementById('card');
      this.downloadButton = document.getElementById('download-card-btn');
      
      // Initialize
      this.initialize();
    }
    
    initialize() {
      console.log("Initializing Enhanced Download Manager");
      
      // Create temp container for rendering
      this.createTempContainer();
      
      // Set up download button if it exists
      if (this.downloadButton) {
        this.downloadButton.addEventListener('click', () => this.showDownloadModal());
      } else {
        this.createDownloadButton();
      }
    }
    
    createTempContainer() {
      // Remove existing container
      const existingContainer = document.getElementById('temp-render-container');
      if (existingContainer) {
        existingContainer.remove();
      }
      
      // Create hidden container for rendering
      const tempContainer = document.createElement('div');
      tempContainer.id = 'temp-render-container';
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.visibility = 'hidden';
      tempContainer.style.width = '747px'; // Base card width
      tempContainer.style.height = '1038px'; // Base card height
      tempContainer.style.overflow = 'hidden';
      tempContainer.style.margin = '0';
      tempContainer.style.padding = '0';
      
      document.body.appendChild(tempContainer);
    }
    
    createDownloadButton() {
      const container = document.querySelector('.img-drop-container');
      if (!container) return;
      
      // Check if button already exists
      if (document.getElementById('download-card-btn')) return;
      
      // Create button
      const downloadBtn = document.createElement('button');
      downloadBtn.id = 'download-card-btn';
      downloadBtn.className = 'download-btn action-button';
      downloadBtn.textContent = 'Download Card';
      
      // Add click handler
      downloadBtn.addEventListener('click', () => this.showDownloadModal());
      
      // Find or create button container
      let buttonArea = container.querySelector('.action-buttons');
      if (!buttonArea) {
        buttonArea = document.createElement('div');
        buttonArea.className = 'action-buttons';
        buttonArea.style.marginTop = '15px';
        container.appendChild(buttonArea);
      }
      
      buttonArea.appendChild(downloadBtn);
      this.downloadButton = downloadBtn;
    }
    
    showDownloadModal() {
      // Remove existing modal
      const existingModal = document.querySelector('.card-preview-modal');
      if (existingModal) existingModal.remove();
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'card-preview-modal';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      
      // Add title
      const title = document.createElement('h2');
      title.textContent = 'Card Preview';
      title.style.marginBottom = '15px';
      title.style.color = '#177edf';
      modalContent.appendChild(title);
      
      // Create preview container
      const previewContainer = document.createElement('div');
      previewContainer.className = 'preview-container';
      
      // Calculate preview dimensions
      const cardAspectRatio = 747 / 1038;
      const previewWidth = Math.min(window.innerWidth * 0.4, 400);
      const previewHeight = previewWidth / cardAspectRatio;
      
      // Clone the card for preview
      if (!this.cardElement) {
        alert('Card element not found!');
        return;
      }
      
      const cardClone = this.cardElement.cloneNode(true);
      cardClone.id = 'card-preview';
      cardClone.style.width = `${previewWidth}px`;
      cardClone.style.height = `${previewHeight}px`;
      cardClone.style.margin = '0 auto';
      cardClone.style.position = 'relative';
      
      // Make sure card container is visible
      const cardContainer = cardClone.querySelector('.card-container');
      if (cardContainer) {
        cardContainer.style.display = 'block';
      }
      
      previewContainer.appendChild(cardClone);
      modalContent.appendChild(previewContainer);
      
      // Add button container
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.marginTop = '15px';
      buttonContainer.style.gap = '10px';
      
      // Add download button
      const downloadButton = document.createElement('button');
      downloadButton.textContent = 'Download';
      downloadButton.className = 'action-button';
      downloadButton.style.backgroundColor = '#4caf50';
      downloadButton.style.color = 'white';
      downloadButton.style.cursor = 'pointer';
      
      // Add cancel button
      const cancelButton = document.createElement('button');
      cancelButton.textContent = 'Cancel';
      cancelButton.className = 'action-button';
      cancelButton.style.backgroundColor = '#f44336';
      cancelButton.style.color = 'white';
      cancelButton.style.cursor = 'pointer';
      
      // Add button events
      downloadButton.addEventListener('click', () => {
        downloadButton.textContent = 'Generating...';
        downloadButton.disabled = true;
        
        // Use enhanced download
        this.downloadCardWithLayers()
          .catch(err => {
            console.error("Error during card download:", err);
            alert("Failed to generate card image. See console for details.");
          })
          .finally(() => {
            document.body.removeChild(modal);
          });
      });
      
      cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
      
      // Close on outside click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
        }
      });
      
      buttonContainer.appendChild(downloadButton);
      buttonContainer.appendChild(cancelButton);
      modalContent.appendChild(buttonContainer);
      
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
      
      // Fix formatting
      this.fixCardPreviewFormatting(cardClone);
    }
    
    fixCardPreviewFormatting(cardPreview) {
      // Card container
      const cardContainer = cardPreview.querySelector(".card-container");
      if (cardContainer) {
        cardContainer.style.display = "block";
        cardContainer.style.position = "relative";
        cardContainer.style.zIndex = "5";
      }
      
      // Card top
      const cardTop = cardPreview.querySelector(".card-top");
      if (cardTop) {
        cardTop.style.position = "relative";
        cardTop.style.zIndex = "6";
      }
      
      // Card bottom
      const cardBottom = cardPreview.querySelector(".card-bottom");
      if (cardBottom) {
        cardBottom.style.position = "relative";
        cardBottom.style.zIndex = "6";
      }
      
      // Card name
      const cardName = cardPreview.querySelector(".card-name");
      if (cardName) {
        cardName.style.position = "relative";
        cardName.style.fontSize = "min(33.6px, 2.1vw)";
        cardName.style.transform = "scaleX(0.9) translateX(-7%)";
        cardName.style.zIndex = "7";
      }
      
      // HP container
      const hpContainer = cardPreview.querySelector(".hp-container");
      if (hpContainer) {
        hpContainer.style.position = "relative";
        hpContainer.style.top = "0.1vw";
        hpContainer.style.zIndex = "7";
      }
      
      // Card HP
      const cardHp = cardPreview.querySelector(".card-hp");
      if (cardHp) {
        cardHp.style.position = "relative";
        cardHp.style.fontSize = "min(4.8px, 0.3vw)";
        cardHp.style.fontFamily = "'Lato', 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif";
        cardHp.style.display = "inline-block";
        cardHp.style.left = "0.35vw";
      }
      
      // HP
      const hp = cardPreview.querySelector(".hp");
      if (hp) {
        hp.style.fontSize = "min(28.8px, 1.8vw)";
        hp.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
        hp.style.transform = "scaleX(0.9) translateX(5%)";
        hp.style.fontWeight = "bold";
        hp.style.display = "inline-block";
      }
      
      // Attacks
      const attacks = cardPreview.querySelectorAll(".attack");
      attacks.forEach((attack) => {
        attack.style.position = "relative";
        attack.style.zIndex = "7";
      });
      
      // Footer
      const footer = cardPreview.querySelector(".card-footer");
      if (footer) {
        footer.style.position = "relative";
        footer.style.zIndex = "7";
      }
      
      // Show hidden elements
      const hiddenElements = cardPreview.querySelectorAll('[style*="display: none"]');
      hiddenElements.forEach((element) => {
        const stage = document.getElementById("stage")?.value || "basic";
        
        if (
          ((element.classList.contains("small-img") || 
            element.classList.contains("evolves-from")) && 
           stage === "basic") || 
          element.closest(".input-body")?.style.height === "0px"
        ) {
          return;
        }
        
        element.style.display = "block";
      });
    }
    
    async downloadCardWithLayers() {
      if (!this.cardElement) {
        throw new Error('Card element not found');
      }
      
      // Get temp container
      const tempContainer = document.getElementById('temp-render-container');
      if (!tempContainer) {
        throw new Error('Temp container not found');
      }
      
      tempContainer.innerHTML = ''; // Clear previous content
      
      // Configuration
      const scaleFactor = 2; // Higher resolution
      const baseWidth = 747; // Base card dimensions
      const baseHeight = 1038;
      const targetWidth = baseWidth * scaleFactor;
      const targetHeight = baseHeight * scaleFactor;
      
      // Get layers (if enhanced layer manager exists)
      let layers = [];
      
      if (window.enhancedLayerManager && window.enhancedLayerManager.layers) {
        // Use enhanced layer manager
        layers = window.enhancedLayerManager.layers.filter(l => l.visible);
        
        // Sort by z-index
        layers.sort((a, b) => a.zIndex - b.zIndex);
      } else {
        // Fallback: Create basic layers from existing structure
        
        // Background layer
        if (document.getElementById('custom-bg-layer')) {
          layers.push({
            id: 'custom-bg-layer',
            type: 'background',
            zIndex: 0
          });
        }
        
        // Primary type (card background)
        layers.push({
          id: 'card-background',
          type: 'primary-type',
          zIndex: 1
        });
        
        // Secondary type layer
        if (document.getElementById('second-card-layer')) {
          layers.push({
            id: 'second-card-layer',
            type: 'secondary-type',
            zIndex: 2
          });
        }
        
        // Custom layers by class
        const customLayers = document.querySelectorAll('.custom-layer');
        customLayers.forEach((layer, index) => {
          layers.push({
            id: layer.id,
            type: 'custom',
            zIndex: 10 + index
          });
        });
        
        // Card content
        layers.push({
          id: 'card-content',
          type: 'content',
          zIndex: 100
        });
      }
      
      console.log("Layers to composite:", layers);
      
      // Create final canvas
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetWidth;
      finalCanvas.height = targetHeight;
      const ctx = finalCanvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Capture a layer
      const captureLayer = async (layer) => {
        // Create clone
        const clone = this.cardElement.cloneNode(true);
        clone.id = `capture-clone-${Date.now()}`;
        
        // Style the clone
        clone.style.width = `${baseWidth}px`;
        clone.style.height = `${baseHeight}px`;
        clone.style.position = 'absolute';
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.margin = '0';
        clone.style.padding = '0';
        clone.style.boxShadow = 'none';
        clone.style.transform = 'none';
        
        // Prepare based on layer type
        if (layer.type === 'primary-type') {
          // Primary type (card background)
          clone.style.backgroundImage = window.getComputedStyle(this.cardElement).backgroundImage;
          clone.style.backgroundSize = window.getComputedStyle(this.cardElement).backgroundSize;
          clone.style.backgroundRepeat = window.getComputedStyle(this.cardElement).backgroundRepeat;
          clone.style.backgroundPosition = window.getComputedStyle(this.cardElement).backgroundPosition;
          
          // Hide content
          const cardContainer = clone.querySelector('.card-container');
          if (cardContainer) {
            cardContainer.style.visibility = 'hidden';
          }
          
          // Hide other layers
          const otherLayers = clone.querySelectorAll('.layer-element, .custom-layer, #second-card-layer, #custom-bg-layer');
          otherLayers.forEach(el => {
            el.style.display = 'none';
          });
        } 
        else if (layer.type === 'secondary-type') {
          // Secondary type layer
          clone.style.backgroundImage = 'none';
          
          // Hide content
          const cardContainer = clone.querySelector('.card-container');
          if (cardContainer) {
            cardContainer.style.visibility = 'hidden';
          }
          
          // Hide other layers
          const otherLayers = clone.querySelectorAll('.layer-element, .custom-layer, #custom-bg-layer');
          otherLayers.forEach(el => {
            el.style.display = 'none';
          });
          
          // Show only secondary layer
          const secondLayer = clone.querySelector('#second-card-layer');
          if (secondLayer) {
            secondLayer.style.display = 'block';
          } else {
            // If not found in clone, try to find in original and copy
            const originalLayer = document.getElementById('second-card-layer');
            if (originalLayer) {
              const copy = originalLayer.cloneNode(true);
              clone.appendChild(copy);
            }
          }
        }
        else if (layer.type === 'background') {
          // Background layer
          clone.style.backgroundImage = 'none';
          
          // Hide content
          const cardContainer = clone.querySelector('.card-container');
          if (cardContainer) {
            cardContainer.style.visibility = 'hidden';
          }
          
          // Hide other layers
          const otherLayers = clone.querySelectorAll('.layer-element, .custom-layer, #second-card-layer');
          otherLayers.forEach(el => {
            el.style.display = 'none';
          });
          
          // Show only background layer
          const bgLayer = clone.querySelector('#custom-bg-layer');
          if (bgLayer) {
            bgLayer.style.display = 'block';
          } else {
            // If not found in clone, try to find in original and copy
            const originalLayer = document.getElementById('custom-bg-layer');
            if (originalLayer) {
              const copy = originalLayer.cloneNode(true);
              clone.appendChild(copy);
            }
          }
        }
        else if (layer.type === 'custom' || layer.type === 'image') {
          // Custom or image layer
          clone.style.backgroundImage = 'none';
          
          // Hide content
          const cardContainer = clone.querySelector('.card-container');
          if (cardContainer) {
            cardContainer.style.visibility = 'hidden';
          }
          
          // Hide all layers
          const allLayers = clone.querySelectorAll('.layer-element, .custom-layer, #second-card-layer, #custom-bg-layer');
          allLayers.forEach(el => {
            el.style.display = 'none';
          });
          
          // Show only this layer
          const layerElement = clone.querySelector(`#${layer.id}`);
          if (layerElement) {
            layerElement.style.display = 'block';
          } else {
            // If not found in clone, try to find in original and copy
            const originalLayer = document.getElementById(layer.id);
            if (originalLayer) {
              const copy = originalLayer.cloneNode(true);
              clone.appendChild(copy);
            } else if (layer.src) {
              // For enhanced layer manager layers with src
              const newElement = document.createElement('div');
              newElement.id = layer.id;
              newElement.style.position = 'absolute';
              newElement.style.top = `${layer.y || 0}%`;
              newElement.style.left = `${layer.x || 0}%`;
              newElement.style.width = `${layer.width || 100}%`;
              newElement.style.height = `${layer.height || 100}%`;
              newElement.style.zIndex = layer.zIndex;
              newElement.style.opacity = layer.opacity || 1;
              newElement.style.mixBlendMode = layer.blendMode || 'normal';
              
              // Create image
              const img = document.createElement('img');
              img.src = layer.src;
              img.alt = layer.name || 'Image';
              img.style.width = '100%';
              img.style.height = '100%';
              img.style.objectFit = 'contain';
              
              // Apply mask if present
              if (layer.mask) {
                newElement.style.maskImage = `url(${layer.mask})`;
                newElement.style.webkitMaskImage = `url(${layer.mask})`;
                newElement.style.maskSize = 'contain';
                newElement.style.webkitMaskSize = 'contain';
                newElement.style.maskRepeat = 'no-repeat';
                newElement.style.webkitMaskRepeat = 'no-repeat';
                newElement.style.maskPosition = 'center';
                newElement.style.webkitMaskPosition = 'center';
              }
              
              newElement.appendChild(img);
              clone.appendChild(newElement);
            }
          }
        }
        else if (layer.type === 'content') {
          // Content layer (card text and data)
          clone.style.backgroundImage = 'none';
          
          // Hide all layers
          const allLayers = clone.querySelectorAll('.layer-element, .custom-layer, #second-card-layer, #custom-bg-layer');
          allLayers.forEach(el => {
            el.style.display = 'none';
          });
          
          // Make sure card container is visible
          const cardContainer = clone.querySelector('.card-container');
          if (cardContainer) {
            cardContainer.style.visibility = 'visible';
            cardContainer.style.display = 'block';
          }
        }
        
        // Add to temp container
        tempContainer.innerHTML = '';
        tempContainer.appendChild(clone);
        tempContainer.style.visibility = 'visible';
        
        // Short delay for rendering
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          // Use html2canvas
          const canvas = await html2canvas(tempContainer, {
            scale: scaleFactor,
            allowTaint: true,
            useCORS: true,
            backgroundColor: null,
            logging: true,
            width: baseWidth,
            height: baseHeight,
            x: 0,
            y: 0,
            scrollX: 0,
            scrollY: 0,
            windowWidth: baseWidth,
            windowHeight: baseHeight,
            onclone: (clonedDoc) => {
              const clonedTarget = clonedDoc.getElementById('temp-render-container');
              const clonedCard = clonedTarget?.querySelector(`#${clone.id}`);
              
              // Ensure body margin is 0
              if (clonedDoc.body) {
                clonedDoc.body.style.margin = '0';
              }
            }
          });
          
          return canvas;
        } catch (error) {
          console.error("html2canvas capture error:", error);
          throw error;
        } finally {
          // Clean up
          tempContainer.innerHTML = '';
          tempContainer.style.visibility = 'hidden';
        }
      };
      
      // Composite layers
      try {
        console.log("Starting layer compositing...");
        
        // Clear canvas
        ctx.clearRect(0, 0, targetWidth, targetHeight);
        
        // Process each layer
        for (const layer of layers) {
          console.log(`Processing layer: ${layer.id}`);
          
          // Capture layer
          const layerCanvas = await captureLayer(layer);
          
          // Set blend mode
          ctx.globalCompositeOperation = layer.blendMode || 'source-over';
          
          // Set opacity
          ctx.globalAlpha = layer.opacity !== undefined ? layer.opacity : 1;
          
          // Draw to final canvas
          ctx.drawImage(layerCanvas, 0, 0, targetWidth, targetHeight);
          
          // Reset for next layer
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = 1;
          
          console.log(`Layer ${layer.id} composited`);
        }
        
        // Generate download
        console.log("Finalizing image...");
        
        // Get card name for filename
        const nameElement = document.getElementById('name');
        const pokemonName = nameElement?.value || 'pokemon';
        const fileName = pokemonName.trim() ? `${pokemonName.trim()}-card.png` : 'pokemon-card.png';
        
        // Create data URL
        const imgData = finalCanvas.toDataURL('image/png');
        
        // Create and trigger download
        const link = document.createElement('a');
        link.href = imgData;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log("Download complete!");
      } catch (error) {
        console.error('Error during canvas compositing or download:', error);
        throw error;
      }
    }
  }
  
  // Create instance
  const enhancedDownloadManager = new EnhancedDownloadManager();
  
  // Override existing download function for compatibility
  window.downloadCardWithCanvas = (...args) => enhancedDownloadManager.downloadCardWithLayers(...args);