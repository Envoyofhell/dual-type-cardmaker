/**
 * File: js/modules/export/download.js
 * Purpose: Handles card downloading with proper blend modes and masks
 * Dependencies:
 *   - html2canvas library
 *   - js/modules/layers/layer-manager.js
 * Notes: Fixes issues with blend modes in downloaded images
 */

import layerManager from '../layers/layer-manager.js';

/**
 * Card Downloader - Handles card image export with proper layer compositing
 */
class CardDownloader {
  /**
   * Initialize the card downloader
   * @param {string} cardSelector - Selector for the card element
   */
  constructor(cardSelector = '#card') {
    this.cardElement = document.querySelector(cardSelector);
    this.downloadButton = document.getElementById('download-card-btn');
    
    if (this.downloadButton) {
      this.downloadButton.addEventListener('click', () => this.showDownloadModal());
    }
    
    // Create a temporary container for rendering (hidden from view)
    this.createTempContainer();
  }
  
  /**
   * Create a temporary container for rendering the card
   */
  createTempContainer() {
    // Remove any existing temp container
    const existingContainer = document.getElementById('temp-render-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    
    // Create a new container
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
  
  /**
   * Show the download preview modal
   */
  showDownloadModal() {
    // Remove any existing modal
    const existingModal = document.querySelector('.card-preview-modal');
    if (existingModal) {
      existingModal.remove();
    }
    
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
    
    // Add preview container
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';
    
    // Calculate preview dimensions (maintain aspect ratio)
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
    
    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.marginTop = '15px';
    buttonContainer.style.gap = '10px';
    
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download';
    downloadButton.className = 'action-button';
    downloadButton.style.backgroundColor = '#4caf50';
    downloadButton.style.color = 'white';
    downloadButton.style.cursor = 'pointer';
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'action-button';
    cancelButton.style.backgroundColor = '#f44336';
    cancelButton.style.color = 'white';
    cancelButton.style.cursor = 'pointer';
    
    // Set up button events
    downloadButton.addEventListener('click', () => {
      downloadButton.textContent = 'Generating...';
      downloadButton.disabled = true;
      
      // Use the enhanced download method
      this.downloadCardWithLayers()
        .catch(err => {
          console.error("Error during card download:", err);
          alert("Failed to generate card image. See console for details.");
        })
        .finally(() => {
          // Close the modal
          document.body.removeChild(modal);
        });
    });
    
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside
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
    
    // Fix card preview formatting
    this.fixCardPreviewFormatting(cardClone);
  }
  
  /**
   * Fix formatting for the card preview
   * @param {HTMLElement} cardPreview - The card preview element
   */
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
    
    // Show hidden elements if needed
    const hiddenElements = cardPreview.querySelectorAll('[style*="display: none"]');
    hiddenElements.forEach((element) => {
      const stage = document.getElementById("stage")?.value || "basic";
      
      // Skip small image and evolves-from for basic cards
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
  
  /**
   * Enhanced card download that properly handles layers and blend modes
   * @returns {Promise<void>} Promise that resolves when download is complete
   */
  async downloadCardWithLayers() {
    if (!this.cardElement) {
      throw new Error('Card element not found');
    }
    
    // Get the temp container
    const tempContainer = document.getElementById('temp-render-container');
    if (!tempContainer) {
      throw new Error('Temp container not found');
    }
    
    tempContainer.innerHTML = ''; // Clear previous content
    
    // --- Configuration ---
    const scaleFactor = 2; // Higher resolution
    const baseWidth = 747; // Base dimensions for card
    const baseHeight = 1038;
    const targetWidth = baseWidth * scaleFactor;
    const targetHeight = baseHeight * scaleFactor;
    
    // Get all layers from the layer manager
    const layers = layerManager.getLayers();
    
    // Sort layers by z-index
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    
    // --- Create final canvas ---
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;
    const ctx = finalCanvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // --- Helper to capture a layer ---
    const captureLayer = async (layerData) => {
      // Create a clone of the card for this layer
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
      
      // Special handling based on layer type
      if (layerData.type === 'card') {
        // Card background - show card background image but hide content
        clone.style.backgroundImage = window.getComputedStyle(this.cardElement).backgroundImage;
        clone.style.backgroundSize = window.getComputedStyle(this.cardElement).backgroundSize;
        clone.style.backgroundRepeat = window.getComputedStyle(this.cardElement).backgroundRepeat;
        clone.style.backgroundPosition = window.getComputedStyle(this.cardElement).backgroundPosition;
        
        // Hide card content
        const cardContainer = clone.querySelector('.card-container');
        if (cardContainer) {
          cardContainer.style.visibility = 'hidden';
        }
        
        // Hide all layer elements
        const layerElements = clone.querySelectorAll('.layer-element');
        layerElements.forEach(el => {
          el.style.display = 'none';
        });
      } 
      else if (layerData.type === 'content') {
        // Card content - show only card content but no background
        clone.style.backgroundImage = 'none';
        
        // Hide all layer elements
        const layerElements = clone.querySelectorAll('.layer-element');
        layerElements.forEach(el => {
          el.style.display = 'none';
        });
      } 
      else if (layerData.type === 'image') {
        // Image layer - create a specific image layer
        
        // Hide background and content
        clone.style.backgroundImage = 'none';
        const cardContainer = clone.querySelector('.card-container');
        if (cardContainer) {
          cardContainer.style.visibility = 'hidden';
        }
        
        // Hide all other layer elements
        const layerElements = clone.querySelectorAll('.layer-element');
        layerElements.forEach(el => {
          el.style.display = 'none';
        });
        
        // Create a new image element for this layer
        const layerElement = document.createElement('div');
        layerElement.className = 'layer-element';
        layerElement.style.position = 'absolute';
        layerElement.style.top = `${layerData.y}%`;
        layerElement.style.left = `${layerData.x}%`;
        layerElement.style.width = `${layerData.width}%`;
        layerElement.style.height = `${layerData.height}%`;
        layerElement.style.opacity = layerData.opacity;
        layerElement.style.zIndex = layerData.zIndex;
        
        if (layerData.src) {
          const img = document.createElement('img');
          img.src = layerData.src;
          img.alt = layerData.name;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = layerData.objectFit || 'cover';
          
          layerElement.appendChild(img);
        }
        
        // Apply mask if present
        if (layerData.mask) {
          layerElement.style.maskImage = `url(${layerData.mask})`;
          layerElement.style.webkitMaskImage = `url(${layerData.mask})`;
          layerElement.style.maskSize = 'contain';
          layerElement.style.webkitMaskSize = 'contain';
          layerElement.style.maskRepeat = 'no-repeat';
          layerElement.style.webkitMaskRepeat = 'no-repeat';
          layerElement.style.maskPosition = 'center';
          layerElement.style.webkitMaskPosition = 'center';
        }
        
        clone.appendChild(layerElement);
      }
      
      // Add clone to temp container
      tempContainer.innerHTML = '';
      tempContainer.appendChild(clone);
      tempContainer.style.visibility = 'visible';
      
      // Delay slightly for rendering
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        // Capture the clone
        const canvas = await html2canvas(tempContainer, {
          scale: scaleFactor,
          allowTaint: true,
          useCORS: true,
          backgroundColor: null, // Transparent
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
            
            if (clonedCard) {
              // Additional styling for the cloned card if needed
              // This runs in the html2canvas iframe
            }
            
            // Ensure body margin is 0 in the iframe
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
        tempContainer.innerHTML = '';
        tempContainer.style.visibility = 'hidden';
      }
    };
    
    // --- Capture and composite layers ---
    try {
      console.log("Starting layer compositing...");
      
      // Clear canvas
      ctx.clearRect(0, 0, targetWidth, targetHeight);
      
      // Process each layer
      for (const layer of sortedLayers) {
        if (!layer.visible) {
          console.log(`Skipping hidden layer: ${layer.name}`);
          continue;
        }
        
        console.log(`Processing layer: ${layer.name} (${layer.type})`);
        
        // Capture this layer
        const layerCanvas = await captureLayer(layer);
        
        // Apply the layer's blend mode
        ctx.globalCompositeOperation = layer.blendMode || 'source-over';
        
        // Apply opacity
        ctx.globalAlpha = layer.opacity;
        
        // Draw to the final canvas
        ctx.drawImage(layerCanvas, 0, 0, targetWidth, targetHeight);
        
        // Reset for next layer
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
        
        console.log(`Layer ${layer.name} composited successfully.`);
      }
      
      // --- Generate and trigger download ---
      console.log("Finalizing image...");
      
      // Get card name for filename
      const nameElement = document.getElementById('name');
      const pokemonName = nameElement?.value || 'pokemon';
      const fileName = pokemonName.trim() ? `${pokemonName.trim()}-card.png` : 'pokemon-card.png';
      
      // Create data URL
      const imgData = finalCanvas.toDataURL('image/png');
      
      // Create and trigger download link
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

// Create and export a singleton instance
const cardDownloader = new CardDownloader();

// Replace the existing downloadCardWithCanvas function
window.downloadCardWithCanvas = (...args) => cardDownloader.downloadCardWithLayers(...args);

export default cardDownloader;