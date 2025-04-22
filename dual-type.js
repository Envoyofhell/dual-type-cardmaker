// Pokemon Card Maker - Dual Type Extension
// This script adds dual-type functionality to the main Pokemon Card Maker

// Global variables for dual-type functionality
let isDualType = false;
let secondType = '';
let maskImage = null;
let primaryCardImage = null;
let secondaryCardImage = null;
let originalBaseImageSrc = null;
let defaultMaskPath = 'img/mask.png';

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing dual-type functionality...");
    // Create and append dual-type UI elements
    createDualTypeElements();
    // Set up event handlers
    setupDualTypeHandlers();
    // Initialize default mask
    initializeDefaultMask();
});

// Function to create and append UI elements for dual-type functionality
function createDualTypeElements() {
    // 1. Create dual-type toggle container and add after type selector
    const typeSelector = document.getElementById('type-selector');
    if (!typeSelector) {
        console.error("Type selector element not found");
        return;
    }

    const dualTypeContainer = document.createElement('div');
    dualTypeContainer.id = 'dual-type-container';
    dualTypeContainer.innerHTML = `
        <div class="type-toggle">
            <label for="dual-type-toggle">Dual Type:</label>
            <input type="checkbox" id="dual-type-toggle" name="dual-type-toggle">
        </div>
        <div id="second-type-selector" class="hidden">
            <p>Second Type:</p>
            <ul id="second-type-list">
                <li value="grass" class="select-second-type"><img src="img/grass.png" alt="grass"></li>
                <li value="water" class="select-second-type"><img src="img/water.png" alt="water"></li>
                <li value="fire" class="select-second-type"><img src="img/fire.png" alt="fire"></li>
                <li value="normal" class="select-second-type"><img src="img/normal.png" alt="normal"></li>
                <li value="electric" class="select-second-type"><img src="img/electric.png" alt="electric"></li>
                <li value="psychic" class="select-second-type"><img src="img/psychic.png" alt="psychic"></li>
                <li value="fighting" class="select-second-type"><img src="img/fighting.png" alt="fighting"></li>
                <li value="dark" class="select-second-type"><img src="img/dark.png" alt="dark"></li>
                <li value="metal" class="select-second-type"><img src="img/metal.png" alt="metal"></li>
            </ul>
        </div>
    `;
    
    // Insert after type selector
    typeSelector.after(dualTypeContainer);

    // 2. Create mask drop zone
    const imgDropContainer = document.querySelector('.img-drop-container');
    if (!imgDropContainer) {
        console.error("Image drop container not found");
        return;
    }

    const maskDropZone = document.createElement('div');
    maskDropZone.className = 'img-drop-mask hidden';
    maskDropZone.textContent = 'Drop type mask here.';

    // Insert after the small img drop zone
    const smallImgDrop = imgDropContainer.querySelector('.img-drop-small');
    if (smallImgDrop) {
        smallImgDrop.after(maskDropZone);
    } else {
        // Fallback - append to the container
        imgDropContainer.appendChild(maskDropZone);
    }

    // 3. Add CSS for dual-type elements
    addDualTypeStyles();
}

// Function to add CSS styles for dual-type elements
function addDualTypeStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Dual type container styling */
        #dual-type-container {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 378px;
            margin: 15px auto;
            padding: 10px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
        }

        .type-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
            background: linear-gradient(to bottom, var(--lightblue), var(--darkblue), var(--lightblue));
            padding: 8px;
            border-radius: 8px;
        }

        .type-toggle label {
            margin-right: 10px;
            color: white;
            text-shadow: 1px 0 1px #1365b3, 0 1px 1px #1365b3;
            font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
            font-size: 14pt;
        }
        
        #dual-type-toggle {
            width: 20px;
            height: 20px;
            cursor: pointer;
        }

        #second-type-selector {
            margin: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 378px;
            max-height: 0;
            transition: max-height 0.5s ease;
            overflow: hidden;
        }

        #second-type-selector.hidden {
            display: none;
        }
        
        #second-type-selector.visible {
            max-height: 500px;
        }

        #second-type-selector p {
            width: 100%;
            text-align: center;
            font-size: 14pt;
            color: white;
            text-shadow: 1px 0 1px #1365b3, 0 1px 1px #1365b3;
            margin-top: 5px;
            margin-bottom: 10px;
            font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
        }

        #second-type-list {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            list-style-type: none;
            width: 100%;
            padding: 0;
            margin: 0;
        }

        .select-second-type {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            outline: 2px solid var(--offwhite);
            border-radius: 6px;
            background-color: var(--offwhite);
            box-shadow: 0 0 15px var(--darkblue) inset;
            transition: 0.3s;
            margin: 3px;
        }

        .select-second-type.highlight {
            outline: 3px solid var(--yellow);
            box-shadow: none;
            background-color: transparent;
            transform: scale(1.1);
        }

        .select-second-type:hover {
            outline: 2px solid var(--yellow);
            box-shadow: none;
            background-color: white;
            cursor: pointer;
        }

        .select-second-type > img {
            width: 26px;
            height: 26px;
        }

        /* Drop zones */
        .img-drop-mask {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 15vw;
            height: 15vw;
            max-width: 160px;
            max-height: 160px;
            margin: 10px auto;
            outline: 5px dotted var(--white);
            border-radius: 15px;
            box-shadow: 0 0 50px var(--offwhite) inset;
            font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
            color: white;
            text-shadow: 1px 0 1px #177edf, 0 1px 1px #177edf;
            transition: 0.3s;
            text-align: center;
            padding: 10px;
        }

        .img-drop-mask.active {
            outline: 8px dotted var(--yellow);
            color: var(--yellow);
            box-shadow: 0 0 50px var(--darkblue) inset;
            text-shadow: 1px 0 1px #ad900f, 0 1px 1px #ad900f;
        }

        /* Hidden class */
        .hidden {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
}

// Function to set up event handlers for dual-type functionality
function setupDualTypeHandlers() {
    // 1. Dual-type toggle handler
    const dualTypeToggle = document.getElementById('dual-type-toggle');
    if (dualTypeToggle) {
        dualTypeToggle.addEventListener('change', function() {
            toggleDualTypeMode(this.checked);
        });
    }

    // 2. Secondary type selection handlers
    const secondTypesArray = document.querySelectorAll('.select-second-type');
    secondTypesArray.forEach(typeElement => {
        typeElement.addEventListener('click', () => updateSecondType(typeElement));
    });

    // 3. Mask image drop zone handlers
    const maskDropZone = document.querySelector('.img-drop-mask');
    if (maskDropZone) {
        maskDropZone.addEventListener('dragenter', event => {
            event.preventDefault();
            maskDropZone.classList.add('active');
        });

        maskDropZone.addEventListener('dragleave', event => {
            event.preventDefault();
            maskDropZone.classList.remove('active');
        });

        maskDropZone.addEventListener('dragover', event => {
            event.preventDefault();
        });

        maskDropZone.addEventListener('drop', event => {
            event.preventDefault();
            maskDropZone.classList.remove('active');
            const file = event.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.addEventListener('loadend', () => {
                    const img = new Image();
                    img.onload = function() {
                        maskImage = img;
                        console.log("Custom mask image loaded.");
                        if (isDualType) updateDualTypeImage();
                    };
                    img.onerror = function() {
                        console.error("Error loading mask image from data URL.");
                        maskImage = null;
                    };
                    img.src = reader.result;
                });
            }
        });
    }

    // 4. Capture the main card image when a type is selected or when the stage changes
    // Monitor changes to the card's class to detect type and stage changes
    const cardElement = document.getElementById('card');
    if (cardElement) {
        // Create a MutationObserver to watch for class changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    // When the card's class changes, capture the background image
                    captureCardBackgroundImage();
                    
                    // If dual type is enabled, update the composite
                    if (isDualType) {
                        setTimeout(updateDualTypeImage, 100);
                    }
                }
            });
        });
        
        // Start observing the card element for class changes
        observer.observe(cardElement, { attributes: true });
        
        // Also trigger on page load to capture initial state
        setTimeout(captureCardBackgroundImage, 500);
    }
    
    // Also listen for stage changes
    const stageSelect = document.querySelector('select[name="stage"]');
    if (stageSelect) {
        stageSelect.addEventListener('change', function() {
            // Wait a bit for the class to update, then capture background
            setTimeout(function() {
                captureCardBackgroundImage();
                
                // If dual type is enabled, update the composite
                if (isDualType) {
                    setTimeout(updateDualTypeImage, 100);
                }
            }, 100);
        });
    }

    // 5. Capture original image source when main image is dropped
    const originalLargeImgDrop = document.querySelector('.img-drop');
    if (originalLargeImgDrop) {
        // Add a new drop event listener to capture the original image
        originalLargeImgDrop.addEventListener('drop', event => {
            const file = event.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.addEventListener('loadend', () => {
                    // Store the original source
                    originalBaseImageSrc = reader.result;
                    console.log("Original base image stored.");
                    
                    // If dual type is active, update the composite after a short delay
                    if (isDualType) {
                        setTimeout(updateDualTypeImage, 200);
                    }
                });
            }
        }, true); // Use capture phase to run before the original handler
    }
}

// Function to toggle dual-type mode
function toggleDualTypeMode(enabled) {
    isDualType = enabled;
    console.log("Dual Type Mode:", isDualType);
    
    // Toggle visibility of dual-type elements
    const secondTypeSelector = document.getElementById('second-type-selector');
    const maskDropZone = document.querySelector('.img-drop-mask');
    
    if (secondTypeSelector) {
        if (enabled) {
            secondTypeSelector.classList.remove('hidden');
            secondTypeSelector.classList.add('visible');
        } else {
            secondTypeSelector.classList.add('hidden');
            secondTypeSelector.classList.remove('visible');
        }
    }
    
    if (maskDropZone) {
        maskDropZone.classList.toggle('hidden', !enabled);
    }
    
    // Let sample-masks.js know about the toggle if it exists
    if (typeof window.toggleSampleMasksVisibility === 'function') {
        window.toggleSampleMasksVisibility(enabled);
    }
    
    if (enabled) {
        console.log("Dual Type Enabled");
        
        // If no mask image is set, use the default
        if (!maskImage && defaultMaskPath) {
            initializeDefaultMask();
        }
        
        // Capture the current card background if we don't have it
        if (!primaryCardImage) {
            captureCardBackgroundImage();
        }
        
        // If we have the necessary images, update the card
        if (originalBaseImageSrc && secondType) {
            updateDualTypeImage();
        }
    } else {
        console.log("Dual Type Disabled");
        // Revert to single type display
        resetToSingleType();
    }
}

// Function to update the second type selection
function updateSecondType(selectedTypeElement) {
    // Remove highlight from previously selected type
    const prevSelected = document.querySelector('#second-type-list .highlight');
    if (prevSelected) {
        prevSelected.classList.remove('highlight');
    }

    // Highlight the newly selected type
    selectedTypeElement.classList.add('highlight');
    
    // Update secondType variable
    secondType = selectedTypeElement.getAttribute('value');
    console.log("Second type selected:", secondType);
    
    // Update the secondary card image
    updateSecondaryCardImage();
    
    // Update the dual-type image
    if (isDualType) {
        updateDualTypeImage();
    }
}

// Function to initialize default mask
function initializeDefaultMask() {
    const defaultMask = new Image();
    defaultMask.onload = function() {
        maskImage = defaultMask;
        console.log("Default mask initialized successfully");
        if (isDualType) updateDualTypeImage();
    };
    defaultMask.onerror = function() {
        console.error("Error loading default mask from:", defaultMaskPath);
    };
    defaultMask.src = defaultMaskPath;
}

// Function to reset to single type
function resetToSingleType() {
    const cardImgContainer = document.querySelector('.card-img');
    if (originalBaseImageSrc && cardImgContainer) {
        // Create a new image with the original source
        const img = document.createElement('img');
        img.src = originalBaseImageSrc;
        cardImgContainer.replaceChildren(img);
    }
}

// Function to capture the current card background image
function captureCardBackgroundImage() {
    const card = document.getElementById('card');
    if (!card) return;
    
    // Get the computed style to access the background image
    const cardStyle = window.getComputedStyle(card);
    const backgroundImage = cardStyle.backgroundImage;
    
    // Extract the URL from the background-image property
    if (backgroundImage && backgroundImage !== 'none') {
        const urlMatch = backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
        if (urlMatch && urlMatch[1]) {
            const imageUrl = urlMatch[1];
            console.log("Captured card background:", imageUrl);
            
            // Create an image object for the primary card background
            primaryCardImage = new Image();
            primaryCardImage.onload = function() {
                console.log("Primary card background loaded");
                
                // If we have a second type selected, update the secondary image too
                if (secondType) {
                    updateSecondaryCardImage();
                }
            };
            primaryCardImage.onerror = function() {
                console.error("Failed to load primary card background:", imageUrl);
                primaryCardImage = null;
            };
            primaryCardImage.src = imageUrl;
        }
    }
}

// Function to update the secondary card image based on selected second type
function updateSecondaryCardImage() {
    if (!secondType) return;
    
    // Get the current stage
    const stage = document.querySelector('select[name="stage"]').value || 'basic';
    
    // Determine the image path based on the selected type and stage
    // Using the naming convention from your CSS
    let imagePath;
    
    if (secondType === 'normal') {
        // Special case for 'normal' type which maps to 'Colorless' in the filenames
        imagePath = `img/${stage === 'basic' ? 'Basic' : stage === 'stage-1' ? 'Stage 1' : 'Stage 2'}/SS_${stage === 'basic' ? 'Basic' : stage === 'stage-1' ? 'Stage1' : 'Stage2'}_Colorless.png`;
    } else if (secondType === 'electric') {
        // Special case for 'electric' type which maps to 'Lightning' in the filenames
        imagePath = `img/${stage === 'basic' ? 'Basic' : stage === 'stage-1' ? 'Stage 1' : 'Stage 2'}/SS_${stage === 'basic' ? 'Basic' : stage === 'stage-1' ? 'Stage1' : 'Stage2'}_Lightning.png`;
    } else {
        // For all other types, capitalize the first letter
        const typeCapitalized = secondType.charAt(0).toUpperCase() + secondType.slice(1);
        imagePath = `img/${stage === 'basic' ? 'Basic' : stage === 'stage-1' ? 'Stage 1' : 'Stage 2'}/SS_${stage === 'basic' ? 'Basic' : stage === 'stage-1' ? 'Stage1' : 'Stage2'}_${typeCapitalized}.png`;
    }
    
    console.log("Loading secondary card background:", imagePath);
    
    // Create an image object for the secondary card background
    secondaryCardImage = new Image();
    secondaryCardImage.onload = function() {
        console.log("Secondary card background loaded");
        if (isDualType) updateDualTypeImage();
    };
    secondaryCardImage.onerror = function() {
        console.error("Failed to load secondary card background:", imagePath);
        secondaryCardImage = null;
    };
    secondaryCardImage.src = imagePath;
}

// Function to composite images using a mask
function compositeImages(baseImage, primaryCard, secondaryCard, maskImage) {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match the images
    canvas.width = baseImage.naturalWidth || baseImage.width;
    canvas.height = baseImage.naturalHeight || baseImage.height;
    
    if (canvas.width === 0 || canvas.height === 0) {
        console.error("Base image has zero dimensions.");
        return null;
    }

    // First draw the user's image (Pokémon image)
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    
    // Save the state with just the base image
    ctx.save();

    // Create temporary canvases for the masked card backgrounds
    const primaryCanvas = document.createElement('canvas');
    const primaryCtx = primaryCanvas.getContext('2d');
    primaryCanvas.width = canvas.width;
    primaryCanvas.height = canvas.height;

    const secondaryCanvas = document.createElement('canvas');
    const secondaryCtx = secondaryCanvas.getContext('2d');
    secondaryCanvas.width = canvas.width;
    secondaryCanvas.height = canvas.height;

    // Draw the primary card background (this will be visible through the white parts of the mask)
    primaryCtx.drawImage(primaryCard, 0, 0, primaryCanvas.width, primaryCanvas.height);
    
    // Apply the mask to the primary background (white parts of mask show through)
    primaryCtx.globalCompositeOperation = 'destination-in';
    primaryCtx.drawImage(maskImage, 0, 0, primaryCanvas.width, primaryCanvas.height);

    // Draw the secondary card background (this will be visible through the black parts of the mask)
    secondaryCtx.drawImage(secondaryCard, 0, 0, secondaryCanvas.width, secondaryCanvas.height);
    
    // Create and apply an inverted mask for the secondary background
    const invertCanvas = document.createElement('canvas');
    const invertCtx = invertCanvas.getContext('2d');
    invertCanvas.width = maskImage.width;
    invertCanvas.height = maskImage.height;
    
    // Draw the mask
    invertCtx.drawImage(maskImage, 0, 0);
    
    // Invert the mask using 'difference' operation
    invertCtx.globalCompositeOperation = 'difference';
    invertCtx.fillStyle = 'white';
    invertCtx.fillRect(0, 0, invertCanvas.width, invertCanvas.height);
    
    // Apply the inverted mask to the secondary background
    secondaryCtx.globalCompositeOperation = 'destination-in';
    secondaryCtx.drawImage(invertCanvas, 0, 0, secondaryCanvas.width, secondaryCanvas.height);

    // Now draw both masked backgrounds onto the main canvas
    // These will be drawn underneath the base image
    
    // First restore to just the base image
    ctx.restore();
    
    // Save this state again
    ctx.save();
    
    // Move the base image to a temporary canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(baseImage, 0, 0);
    
    // Clear the main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw both backgrounds first
    ctx.drawImage(primaryCanvas, 0, 0);
    ctx.drawImage(secondaryCanvas, 0, 0);
    
    // Then draw the user's image on top
    ctx.drawImage(tempCanvas, 0, 0);
    
    return canvas.toDataURL();
}

// Function to update the dual-type image
function updateDualTypeImage() {
    console.log("Updating dual-type image...");
    
    // Check if we have the required components
    if (!originalBaseImageSrc) {
        console.warn("Missing original base image for dual type update.");
        return;
    }
    
    if (!primaryCardImage) {
        console.warn("Missing primary card background image.");
        captureCardBackgroundImage();
        return;
    }
    
    if (!secondaryCardImage && secondType) {
        console.warn("Missing secondary card background image.");
        updateSecondaryCardImage();
        return;
    }
    
    // If we don't have a mask image, try to use the default
    if (!maskImage && defaultMaskPath) {
        console.warn("Missing mask image, using default.");
        initializeDefaultMask();
        return; // Wait for the mask to load
    }
    
    if (!maskImage) {
        console.error("No mask image available for compositing.");
        return;
    }
    
    if (!secondaryCardImage) {
        console.warn("No secondary card image or type selected.");
        return;
    }

    // Load the base image (the Pokémon image)
    const baseImgElement = new Image();
    baseImgElement.onload = function() {
        // Ensure all images are loaded and valid
        if (!maskImage.complete || maskImage.naturalHeight === 0 || 
            !primaryCardImage.complete || primaryCardImage.naturalHeight === 0 ||
            !secondaryCardImage.complete || secondaryCardImage.naturalHeight === 0) {
            console.error("Not all images are loaded properly for compositing.");
            return;
        }

        // Create the composite image
        const compositeSrc = compositeImages(baseImgElement, primaryCardImage, secondaryCardImage, maskImage);

        if (compositeSrc) {
            // Update the card image container - this is a separate DOM element
            // that shows the Pokémon image, not the entire card
            const cardImgContainer = document.querySelector('.card-img');
            if (cardImgContainer) {
                // Create and set a new image with the composite
                const newImg = document.createElement('img');
                newImg.src = compositeSrc;
                cardImgContainer.replaceChildren(newImg);
                console.log("Composite image applied successfully.");
            } else {
                console.error("Card image container not found.");
            }
        } else {
            console.error("Compositing failed.");
        }
    };
    
    baseImgElement.onerror = function() {
        console.error("Failed to load base image for compositing");
    };
    
    baseImgElement.src = originalBaseImageSrc;
}

// Make functions available globally
window.maskImage = maskImage;
window.updateDualTypeImage = updateDualTypeImage;