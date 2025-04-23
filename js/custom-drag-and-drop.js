// Enhanced drag and drop functionality for custom type images and mask
// Initialize after page load
window.addEventListener('load', function() {
    // Delay setup to ensure all other elements are loaded
    setTimeout(setupCustomDragDrop, 1000);
});

function setupCustomDragDrop() {
    console.log("Setting up custom drag areas");
    createCustomDropAreas();
}

function createCustomDropAreas() {
    // Find the container to add the drag areas
    const container = document.querySelector('.img-drop-container');
    if (!container) {
        console.error("Image drop container not found!");
        return;
    }
    
    // Remove any existing areas to avoid duplicates
    const existing = document.querySelector('.custom-areas-container');
    if (existing) existing.remove();
    
    // Create container for the custom areas
    const customContainer = document.createElement('div');
    customContainer.className = 'custom-areas-container';
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Custom Card Elements';
    title.style.color = 'white';
    title.style.margin = '10px 0';
    title.style.textAlign = 'center';
    title.style.textShadow = '1px 0 1px #177edf, 0 1px 1px #177edf';
    title.style.fontFamily = "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif";
    customContainer.appendChild(title);
    
    // Create grid for drop areas
    const grid = document.createElement('div');
    grid.className = 'custom-drop-grid';
    
    // Define the drop areas
    const areas = [
        { id: 'custom-primary', label: 'Primary Type' },
        { id: 'custom-secondary', label: 'Secondary Type' },
        { id: 'custom-mask', label: 'Type Mask' },
        { id: 'custom-bg', label: 'Custom Background' }
    ];
    
    // Create each drop area
    areas.forEach(area => {
        const dropArea = document.createElement('div');
        dropArea.id = area.id;
        dropArea.className = 'custom-drop-area';
        dropArea.textContent = `Drop ${area.label}`;
        
        // Add drag and drop event listeners
        setupDropEvents(dropArea, area.id);
        
        // Add to grid
        grid.appendChild(dropArea);
    });
    
    // Add grid to container
    customContainer.appendChild(grid);
    
    // Add custom container to page
    container.appendChild(customContainer);
    console.log("Custom drop areas added");
}

function setupDropEvents(element, id) {
    // Drag enter event
    element.addEventListener('dragenter', function(e) {
        e.preventDefault();
        this.style.border = '3px dotted var(--yellow)';
        this.style.color = 'var(--yellow)';
        this.style.background = 'rgba(0,50,120,0.3)';
        this.style.textShadow = '1px 0 1px #ad900f, 0 1px 1px #ad900f';
    });
    
    // Drag leave event
    element.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.border = '3px dotted white';
        this.style.color = 'white';
        this.style.background = 'rgba(0,0,0,0.2)';
        this.style.textShadow = '1px 0 1px #177edf, 0 1px 1px #177edf';
    });
    
    // Drag over event (required for drop to work)
    element.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    
    // Drop event
    element.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.border = '3px dotted white';
        this.style.color = 'white';
        this.style.background = 'rgba(0,0,0,0.2)';
        this.style.textShadow = '1px 0 1px #177edf, 0 1px 1px #177edf';
        
        // Process dropped file
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            
            // Check if it's an image
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                
                reader.onload = function(loadEvent) {
                    // Show preview in the drop area
                    element.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = loadEvent.target.result;
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '100%';
                    img.style.objectFit = 'contain';
                    element.appendChild(img);
                    
                    // Apply the image based on which area was used
                    applyCustomImage(id, loadEvent.target.result);
                };
                
                reader.readAsDataURL(file);
            }
        }
    });
}

function applyCustomImage(id, imageSrc) {
    const card = document.getElementById('card');
    if (!card) return;
    
    // Process based on which drop area was used
    switch(id) {
        case 'custom-primary':
            // Replace primary type background
            card.style.backgroundImage = `url(${imageSrc})`;
            card.style.backgroundSize = 'contain';
            card.style.backgroundRepeat = 'no-repeat';
            card.style.backgroundPosition = 'center';
            card.className = ''; // Remove type class
            break;
            
        case 'custom-secondary':
            // Add or update secondary type layer
            if (window.dualTypeSimple && window.dualTypeSimple.isDualTypeEnabled()) {
                // Remove existing second layer
                const existingLayer = document.getElementById('second-card-layer');
                if (existingLayer) existingLayer.remove();
                
                // Create new overlay with custom image
                const overlay = document.createElement('div');
                overlay.id = 'second-card-layer';
                overlay.style.position = 'absolute';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundImage = `url(${imageSrc})`;
                overlay.style.backgroundSize = 'contain';
                overlay.style.backgroundRepeat = 'no-repeat';
                overlay.style.backgroundPosition = 'center';
                
                // Apply mask if available, otherwise use default polygon
                if (window.customMaskPattern) {
                    overlay.style.maskImage = `url(${window.customMaskPattern})`;
                    overlay.style.webkitMaskImage = `url(${window.customMaskPattern})`;
                    overlay.style.maskSize = 'contain';
                    overlay.style.webkitMaskSize = 'contain';
                    overlay.style.maskRepeat = 'no-repeat';
                    overlay.style.webkitMaskRepeat = 'no-repeat';
                } else {
                    overlay.style.clipPath = 'polygon(0 0, 100% 0, 0 100%)';
                    overlay.style.webkitClipPath = 'polygon(0 0, 100% 0, 0 100%)';
                }
                
                overlay.style.zIndex = '1'; // Under card content
                overlay.style.pointerEvents = 'none';
                
                card.appendChild(overlay);
            } else {
                alert('Please enable Dual Type first');
            }
            break;
            
        case 'custom-mask':
            // Store mask image and apply to second layer if exists
            window.customMaskPattern = imageSrc;
            
            const secondLayer = document.getElementById('second-card-layer');
            if (secondLayer) {
                secondLayer.style.maskImage = `url(${imageSrc})`;
                secondLayer.style.webkitMaskImage = `url(${imageSrc})`;
                secondLayer.style.maskSize = 'contain';
                secondLayer.style.webkitMaskSize = 'contain';
                secondLayer.style.maskRepeat = 'no-repeat';
                secondLayer.style.webkitMaskRepeat = 'no-repeat';
                
                // Remove the clip path
                secondLayer.style.clipPath = 'none';
                secondLayer.style.webkitClipPath = 'none';
            } else {
                alert('Please add a second type first');
            }
            break;
            
        case 'custom-bg':
            // Add custom background as a new layer
            const existingBg = document.getElementById('custom-bg-layer');
            if (existingBg) existingBg.remove();
            
            const bgLayer = document.createElement('div');
            bgLayer.id = 'custom-bg-layer';
            bgLayer.style.position = 'absolute';
            bgLayer.style.top = '0';
            bgLayer.style.left = '0';
            bgLayer.style.width = '100%';
            bgLayer.style.height = '100%';
            bgLayer.style.backgroundImage = `url(${imageSrc})`;
            bgLayer.style.backgroundSize = 'contain';
            bgLayer.style.backgroundRepeat = 'no-repeat';
            bgLayer.style.backgroundPosition = 'center';
            bgLayer.style.zIndex = '0'; // Bottom layer
            
            card.appendChild(bgLayer);
            break;
    }
    
    // Make sure card content stays on top
    ensureCardContentOnTop(card);
}

function ensureCardContentOnTop(card) {
    // Ensure card container visible and on top
    const cardContainer = card.querySelector('.card-container');
    if (cardContainer) {
        cardContainer.style.display = 'block';
        cardContainer.style.position = 'relative';
        cardContainer.style.zIndex = '5';
    }
    
    // Fix and elevate card top and bottom sections
    ['card-top', 'card-bottom'].forEach(className => {
        const element = card.querySelector(`.${className}`);
        if (element) {
            element.style.position = 'relative';
            element.style.zIndex = '6';
        }
    });
    
    // Ensure all text elements are above layers
    ['card-name', 'hp-container', 'attack', 'card-footer'].forEach(className => {
        const elements = card.querySelectorAll(`.${className}`);
        elements.forEach(element => {
            element.style.position = 'relative';
            element.style.zIndex = '7';
        });
    });
}