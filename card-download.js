// Card download functionality
// Requires html2canvas: <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Create hidden temp container for image generation
    const tempContainer = document.createElement('div');
    tempContainer.id = 'temp';
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.visibility = 'hidden';
    document.body.appendChild(tempContainer);
    
    // Add download button
    addDownloadButton();
});

// Add download button to the page
function addDownloadButton() {
    const container = document.querySelector('.img-drop-container');
    if (!container) return;
    
    const downloadBtn = document.createElement('button');
    downloadBtn.id = 'download-card-btn';
    downloadBtn.innerHTML = 'Download Card';
    downloadBtn.className = 'download-btn';
    
    downloadBtn.addEventListener('click', function() {
        showPreviewModal();
    });
    
    container.appendChild(downloadBtn);
}

// Create and show the preview modal with correct aspect ratio
function showPreviewModal() {
    // Create modal background
    const modal = document.createElement('div');
    modal.className = 'card-preview-modal';
    
    // Create modal content container
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Card Preview';
    title.style.marginBottom = '15px';
    title.style.color = '#177edf';
    modalContent.appendChild(title);
    
    // Create preview container with aspect ratio preservation
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';
    
    // Get original card
    const originalCard = document.querySelector('#card');
    if (!originalCard) {
        alert('Card not found!');
        return;
    }
    
    // Calculate aspect ratio (standard Pokémon cards are 747:1038 or ~0.72)
    const cardAspectRatio = 0.72;
    
    // Clone the card for preview
    const cardClone = originalCard.cloneNode(true);
    cardClone.id = 'card-preview';
    
    // Set dimensions to maintain aspect ratio
    const previewWidth = Math.min(window.innerWidth * 0.4, 400);
    const previewHeight = previewWidth / cardAspectRatio;
    
    cardClone.style.width = `${previewWidth}px`;
    cardClone.style.height = `${previewHeight}px`;
    cardClone.style.margin = '0 auto';
    cardClone.style.position = 'relative';
    
    // Ensure card container is visible
    const cardContainer = cardClone.querySelector('.card-container');
    if (cardContainer) {
        cardContainer.style.display = 'block';
    }
    
    // Add cloned card to preview container
    previewContainer.appendChild(cardClone);
    modalContent.appendChild(previewContainer);
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    
    // Create download button
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download';
    downloadButton.style.padding = '8px 15px';
    downloadButton.style.backgroundColor = '#4caf50';
    downloadButton.style.color = 'white';
    downloadButton.style.border = 'none';
    downloadButton.style.borderRadius = '5px';
    downloadButton.style.cursor = 'pointer';
    
    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '8px 15px';
    cancelButton.style.backgroundColor = '#f44336';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '5px';
    cancelButton.style.cursor = 'pointer';
    
    // Add event listeners to buttons
    downloadButton.addEventListener('click', function() {
        downloadCard();
    });
    
    cancelButton.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Add buttons to container
    buttonContainer.appendChild(downloadButton);
    buttonContainer.appendChild(cancelButton);
    modalContent.appendChild(buttonContainer);
    
    // Add modal to body
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Fix element positioning in the preview
    fixCardPreviewFormatting(cardClone);
}

// Ensure card preview displays correctly
function fixCardPreviewFormatting(cardPreview) {
    // Ensure card container visible
    const cardContainer = cardPreview.querySelector('.card-container');
    if (cardContainer) {
        cardContainer.style.display = 'block';
        cardContainer.style.position = 'relative';
        cardContainer.style.zIndex = '5';
    }
    
    // Fix card top and bottom sections
    const cardTop = cardPreview.querySelector('.card-top');
    if (cardTop) {
        cardTop.style.position = 'relative';
        cardTop.style.zIndex = '6';
    }
    
    const cardBottom = cardPreview.querySelector('.card-bottom');
    if (cardBottom) {
        cardBottom.style.position = 'relative';
        cardBottom.style.zIndex = '6';
    }
    
    // Fix name and HP positioning
    const cardName = cardPreview.querySelector('.card-name');
    if (cardName) {
        cardName.style.position = 'relative';
        cardName.style.fontSize = 'min(33.6px, 2.1vw)';
        cardName.style.transform = 'scaleX(0.9) translateX(-7%)';
        cardName.style.zIndex = '7';
    }
    
    const hpContainer = cardPreview.querySelector('.hp-container');
    if (hpContainer) {
        hpContainer.style.position = 'relative';
        hpContainer.style.top = '0.1vw';
        hpContainer.style.zIndex = '7';
    }
    
    // Ensure attacks are above background
    const attacks = cardPreview.querySelectorAll('.attack');
    attacks.forEach(attack => {
        attack.style.position = 'relative';
        attack.style.zIndex = '7';
    });
    
    // Ensure any hidden elements are visible for preview
    const hiddenElements = cardPreview.querySelectorAll('[style*="display: none"]');
    hiddenElements.forEach(el => {
        // Only change display if it should be visible in the final card
        if (el.className !== 'small-img' && el.className !== 'evolves-from') {
            el.style.display = 'block';
        }
    });
}

// Generate and download the card (all layers)
function downloadCard() {
    const card = document.querySelector('#card');
    if (!card) {
        alert('Card not found!');
        return;
    }
    
    // Clone the card to avoid modifying the original
    const tempContainer = document.getElementById('temp');
    tempContainer.innerHTML = '';
    
    const cardClone = card.cloneNode(true);
    
    // Set exact dimensions for capturing (match Pokémon card dimensions)
    cardClone.style.width = '747px';
    cardClone.style.height = '1038px';
    cardClone.style.position = 'static';
    cardClone.style.transform = 'none';
    cardClone.style.margin = '0';
    
    // Ensure proper formatting before capture
    const cardContainer = cardClone.querySelector('.card-container');
    if (cardContainer) {
        cardContainer.style.display = 'block';
        cardContainer.style.position = 'relative';
        cardContainer.style.zIndex = '5';
    }
    
    // Ensure all card layers and elements are properly positioned for capture
    prepareCardForCapture(cardClone);
    
    // Add clone to temp container
    tempContainer.appendChild(cardClone);
    tempContainer.style.visibility = 'visible'; // Make visible for html2canvas
    
    // Use html2canvas to generate image
    html2canvas(cardClone, {
        scale: 2, // Higher resolution
        allowTaint: true, 
        useCORS: true,
        backgroundColor: null, // Transparent background
        logging: true, // Enable logging for debugging
        onclone: function(clonedDoc) {
            // Additional fixes for the cloned document before capture
            const clonedCard = clonedDoc.querySelector('#card');
            if (clonedCard) {
                prepareCardForCapture(clonedCard);
            }
        }
    }).then(function(canvas) {
        // Convert to image data
        const imgData = canvas.toDataURL('image/png');
        
        // Create download link
        const link = document.createElement('a');
        
        // Get Pokémon name for filename
        const pokemonName = document.querySelector('.card-name')?.textContent || 'pokemon';
        const fileName = pokemonName.trim() ? `${pokemonName.trim()}-card.png` : 'pokemon-card.png';
        
        link.href = imgData;
        link.download = fileName;
        
        // Trigger download
        link.click();
        
        // Clean up
        tempContainer.innerHTML = '';
        tempContainer.style.visibility = 'hidden';
        
        // Close modal
        const modal = document.querySelector('.card-preview-modal');
        if (modal) {
            document.body.removeChild(modal);
        }
    }).catch(function(error) {
        console.error('Error generating image:', error);
        alert('Failed to generate image. Please try again.');
    });
}

// Prepare the card clone for capturing all elements and layers
function prepareCardForCapture(card) {
    // Make sure all layers are present and visible
    const cardLayers = card.querySelectorAll('[id$="-layer"]');
    cardLayers.forEach(layer => {
        layer.style.position = 'absolute';
        layer.style.visibility = 'visible';
    });
    
    // Fix card top and bottom sections
    const cardTop = card.querySelector('.card-top');
    if (cardTop) {
        cardTop.style.position = 'relative';
        cardTop.style.zIndex = '6';
    }
    
    const cardBottom = card.querySelector('.card-bottom');
    if (cardBottom) {
        cardBottom.style.position = 'relative';
        cardBottom.style.zIndex = '6';
    }
    
    // Fix name and HP positioning
    const cardName = card.querySelector('.card-name');
    if (cardName) {
        cardName.style.position = 'relative';
        cardName.style.fontSize = 'min(33.6px, 2.1vw)';
        cardName.style.transform = 'scaleX(0.9) translateX(-7%)';
        cardName.style.zIndex = '7';
    }
    
    const hpContainer = card.querySelector('.hp-container');
    if (hpContainer) {
        hpContainer.style.position = 'relative';
        hpContainer.style.top = '0.1vw';
        hpContainer.style.zIndex = '7';
    }
    
    // Fix HP text
    const cardHp = card.querySelector('.card-hp');
    if (cardHp) {
        cardHp.style.position = 'relative';
        cardHp.style.fontSize = 'min(4.8px, 0.3vw)';
        cardHp.style.fontFamily = "'Lato', 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif";
        cardHp.style.display = 'inline-block';
        cardHp.style.left = '0.35vw';
    }
    
    const hp = card.querySelector('.hp');
    if (hp) {
        hp.style.fontSize = 'min(28.8px, 1.8vw)';
        hp.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
        hp.style.transform = 'scaleX(0.9) translateX(5%)';
        hp.style.fontWeight = 'bold';
        hp.style.display = 'inline-block';
    }
    
    // Ensure attacks are above background
    const attacks = card.querySelectorAll('.attack');
    attacks.forEach(attack => {
        attack.style.position = 'relative';
        attack.style.zIndex = '7';
    });
    
    // Ensure footer elements are above background
    const footer = card.querySelector('.card-footer');
    if (footer) {
        footer.style.position = 'relative';
        footer.style.zIndex = '7';
    }
}