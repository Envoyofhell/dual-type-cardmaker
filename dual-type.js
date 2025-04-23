// Global variables for dual-type functionality
let secondType = '';
let pastSecondType = '';
let maskImage = null;        // For dual-type mask
let secondTypeImage = null;  // For second type image
let originalBaseImageSrc = null; // To store original base image src
let isDualType = false;      // Flag for dual-type mode
let pastSecondTypeElement = null; // Keep track of the selected second type element

// Initialize dual-type functionality
function initDualType() {
    // Get the dual-type toggle element
    const dualTypeToggle = document.getElementById('dual-type-toggle');
    const secondTypeSelector = document.getElementById('second-type-selector');
    const imgDropMask = document.querySelector('.img-drop-mask');
    const imgDropSecond = document.querySelector('.img-drop-second');
    
    if (!dualTypeToggle || !secondTypeSelector || !imgDropMask || !imgDropSecond) {
        console.error("Missing dual-type elements");
        return;
    }

    // Add event listener for the dual-type toggle
    dualTypeToggle.addEventListener('change', function() {
        isDualType = this.checked;
        
        // Show/hide second type selector and image drop areas
        if (isDualType) {
            secondTypeSelector.classList.remove('hidden');
            imgDropMask.classList.remove('hidden');
            imgDropSecond.classList.remove('hidden');
            console.log("Dual Type Enabled");
            
            // If we already have the necessary images, update the composite
            if (originalBaseImageSrc && maskImage && secondTypeImage) {
                updateDualTypeImage();
            }
        } else {
            secondTypeSelector.classList.add('hidden');
            imgDropMask.classList.add('hidden');
            imgDropSecond.classList.add('hidden');
            console.log("Dual Type Disabled");
            
            // Revert to single type display
            const cardImgContainer = document.querySelector('.card-img');
            if (originalBaseImageSrc && cardImgContainer) {
                // Use the stored original image if we have one
                let imgElement = cardImgContainer.querySelector('img');
                if (!imgElement) {
                    imgElement = document.createElement('img');
                }
                imgElement.src = originalBaseImageSrc;
                cardImgContainer.replaceChildren(imgElement);
            }
        }
    });

    // Set up second type selection
    setupSecondTypeSelection();
    
    // Initialize mask and second type image drop areas
    setupDualTypeImageDropAreas();
}

// Setup second type selection functionality
function setupSecondTypeSelection() {
    const secondTypeArray = document.querySelectorAll('.select-second-type');
    
    secondTypeArray.forEach(typeElement => {
        typeElement.addEventListener('click', () => updateSecondType(typeElement));
    });
}

// Update second type when selected
function updateSecondType(selectedTypeElement) {
    // Remove highlight from previously selected type
    if (pastSecondTypeElement) {
        pastSecondTypeElement.classList.remove('highlight');
    }

    // Highlight the newly selected type
    selectedTypeElement.classList.add('highlight');
    pastSecondTypeElement = selectedTypeElement; // Store current element as past one

    // Update secondType variable
    const newType = selectedTypeElement.getAttribute('value');
    if (newType !== secondType) {
        pastSecondType = secondType;
        secondType = newType;
        
        // Update second type image based on the selected type
        loadSecondTypeImage();
    }
}

// Load the second type image based on the selected second type
function loadSecondTypeImage() {
    if (!secondType) return;
    
    // Determine the stage for the current card
    const stage = document.getElementById('stage')?.value || 'basic';
    
    // Create path to the appropriate card background image
    const imagePath = `img/${stage === 'basic' ? 'Basic' : stage === 'stage-1' ? 'Stage 1' : 'Stage 2'}/SS_${stage === 'basic' ? 'Basic' : stage === 'stage-1' ? 'Stage1' : 'Stage2'}_${capitalizeFirstLetter(secondType)}.png`;
    
    // Load the image
    const img = new Image();
    img.onload = function() {
        secondTypeImage = img;
        console.log(`Second type image loaded: ${imagePath}`);
        
        // Update the composite if dual type is enabled
        if (isDualType) {
            updateDualTypeImage();
        }
    };
    
    img.onerror = function() {
        console.error(`Failed to load second type image: ${imagePath}`);
        secondTypeImage = null;
    };
    
    img.src = imagePath;
}

// Helper to capitalize first letter (for file path construction)
function capitalizeFirstLetter(string) {
    if (!string) return '';
    
    // Special cases for types that need specific capitalization in file names
    switch(string) {
        case 'normal':
            return 'Colorless';
        case 'electric':
            return 'Lightning';
        default:
            return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

// Set up drag & drop functionality for mask and second type images
function setupDualTypeImageDropAreas() {
    setupMaskImageDrop();
    setupSecondTypeImageDrop();
}

// Set up drag & drop for the mask image
function setupMaskImageDrop() {
    const maskImgDrop = document.querySelector('.img-drop-mask');
    
    if (!maskImgDrop) {
        console.warn("Element with class '.img-drop-mask' not found.");
        return;
    }
    
    maskImgDrop.addEventListener('dragenter', event => {
        event.preventDefault();
        maskImgDrop.classList.add('active');
    });

    maskImgDrop.addEventListener('dragleave', event => {
        event.preventDefault();
        maskImgDrop.classList.remove('active');
    });

    maskImgDrop.addEventListener('dragover', event => {
        event.preventDefault();
    });

    maskImgDrop.addEventListener('drop', event => {
        event.preventDefault();
        maskImgDrop.classList.remove('active');
        const file = event.dataTransfer.files[0];
        
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.addEventListener('loadend', () => {
                const img = new Image();
                img.onload = function() {
                    maskImage = img;
                    console.log("Mask image loaded.");
                    if (isDualType) updateDualTypeImage();
                };
                
                img.onerror = function() {
                    console.error("Error loading mask image from data URL.");
                    maskImage = null;
                };
                
                img.src = reader.result;
            });
            
            reader.onerror = () => {
                console.error("Error reading dropped mask file.");
            };
        } else {
            console.warn("Dropped file is not an image or no file dropped for mask.");
        }
    });
}

// Set up drag & drop for the second type image
function setupSecondTypeImageDrop() {
    const secondImgDrop = document.querySelector('.img-drop-second');
    
    if (!secondImgDrop) {
        console.warn("Element with class '.img-drop-second' not found.");
        return;
    }
    
    secondImgDrop.addEventListener('dragenter', event => {
        event.preventDefault();
        secondImgDrop.classList.add('active');
    });

    secondImgDrop.addEventListener('dragleave', event => {
        event.preventDefault();
        secondImgDrop.classList.remove('active');
    });

    secondImgDrop.addEventListener('dragover', event => {
        event.preventDefault();
    });

    secondImgDrop.addEventListener('drop', event => {
        event.preventDefault();
        secondImgDrop.classList.remove('active');
        const file = event.dataTransfer.files[0];
        
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.addEventListener('loadend', () => {
                const img = new Image();
                img.onload = function() {
                    secondTypeImage = img;
                    console.log("Second type image loaded.");
                    if (isDualType) updateDualTypeImage();
                };
                
                img.onerror = function() {
                    console.error("Error loading second type image from data URL.");
                    secondTypeImage = null;
                };
                
                img.src = reader.result;
            });
            
            reader.onerror = () => {
                console.error("Error reading dropped second type file.");
            };
        } else {
            console.warn("Dropped file is not an image or no file dropped for second type.");
        }
    });
}

// Composite images using a mask
function compositeImages(baseImage, overlayImage, maskImage) {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match the images
    canvas.width = baseImage.naturalWidth || baseImage.width;
    canvas.height = baseImage.naturalHeight || baseImage.height;
    
    if (canvas.width === 0 || canvas.height === 0) {
        console.error("Base image has zero dimensions.");
        return null; // Cannot composite
    }

    // Draw the base image
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    // Set the global composite operation for mask application
    ctx.globalCompositeOperation = 'destination-in';

    // Draw the mask (will keep only the parts of base image where mask is white)
    ctx.drawImage(maskImage, 0, 0, canvas.width, canvas.height);

    // Create a second canvas for the overlay image
    const canvas2 = document.createElement('canvas');
    const ctx2 = canvas2.getContext('2d');

    // Set second canvas dimensions like the first one
    canvas2.width = canvas.width;
    canvas2.height = canvas.height;

    // Draw the overlay image onto the second canvas
    ctx2.drawImage(overlayImage, 0, 0, canvas2.width, canvas2.height);

    // Apply inverse mask to overlay image using destination-in
    ctx2.globalCompositeOperation = 'destination-in';

    // Create inverted mask on a temporary canvas
    const invertCanvas = document.createElement('canvas');
    const invertCtx = invertCanvas.getContext('2d');
    invertCanvas.width = maskImage.naturalWidth || maskImage.width;
    invertCanvas.height = maskImage.naturalHeight || maskImage.height;
    
    if (invertCanvas.width === 0 || invertCanvas.height === 0) {
        console.error("Mask image has zero dimensions.");
        return null; // Cannot composite
    }

    // Draw original mask
    invertCtx.drawImage(maskImage, 0, 0);

    // Invert the mask: Draw white rectangle, then use 'difference'
    invertCtx.globalCompositeOperation = 'difference';
    invertCtx.fillStyle = 'white';
    invertCtx.fillRect(0, 0, invertCanvas.width, invertCanvas.height);

    // Apply inverted mask (scaled) to the second canvas (overlay image)
    ctx2.drawImage(invertCanvas, 0, 0, canvas2.width, canvas2.height);

    // Reset composite operation for the main canvas before drawing the second canvas
    ctx.globalCompositeOperation = 'source-over';

    // Draw the masked overlay (canvas2) onto the masked base (canvas)
    ctx.drawImage(canvas2, 0, 0);

    // Return the composited image as a data URL
    return canvas.toDataURL();
}

// Function to create and display the composite image
function updateDualTypeImage() {
    console.log("Updating dual type image with:", {
        hasMask: !!maskImage, 
        hasSecondType: !!secondTypeImage,
        hasOriginalBase: !!originalBaseImageSrc
    });
    
    // Check if we have all the images we need AND the original base source
    if (!maskImage || !secondTypeImage || !originalBaseImageSrc) {
        console.warn("Missing images or original base source for dual type update.");
        if (!maskImage) console.warn("Missing mask image");
        if (!secondTypeImage) console.warn("Missing second type image");
        if (!originalBaseImageSrc) console.warn("Missing original base image source");
        return;
    }

    const baseImgElement = new Image();
    baseImgElement.crossOrigin = "Anonymous"; // Try to handle CORS issues
    baseImgElement.src = originalBaseImageSrc; // Use the stored original source

    baseImgElement.onload = function() {
        console.log("Base image loaded successfully", baseImgElement.width, "x", baseImgElement.height);
        
        // Ensure maskImage and secondTypeImage are also loaded and valid Image objects
        if (!maskImage.complete || maskImage.naturalHeight === 0 || 
            !secondTypeImage.complete || secondTypeImage.naturalHeight === 0) {
            console.error("Mask or Second Type image not loaded properly for compositing.");
            return; // Prevent errors if images aren't ready
        }

        // Create the composite image
        const compositeSrc = compositeImages(baseImgElement, secondTypeImage, maskImage);

        if (compositeSrc) {
            console.log("Composite created successfully");
            // Update the card image
            const newImg = document.createElement('img');
            newImg.src = compositeSrc;
            document.querySelector('.card-img').replaceChildren(newImg);
        } else {
            console.error("Compositing failed.");
        }
    };
    
    baseImgElement.onerror = function() {
        console.error("Failed to load base image for compositing from src:", originalBaseImageSrc);
    };
}

// Store original base image source
function storeOriginalBaseImage(src) {
    originalBaseImageSrc = src;
    console.log("Original base image stored");
}

// Intercept the large image drop without overriding the original handler
function interceptLargeImageDrop() {
    // Find the original large image drop area
    const largeImgDrop = document.querySelector('.img-drop');
    
    if (!largeImgDrop) {
        console.error("Large image drop area not found");
        return;
    }
    
    // Create a MutationObserver to watch for changes to the card-img container
    const cardImgObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if an image was added
                const addedImg = mutation.addedNodes[0];
                if (addedImg.tagName === 'IMG') {
                    // Store the original image source
                    originalBaseImageSrc = addedImg.src;
                    console.log("Original base image captured:", originalBaseImageSrc);
                    
                    // If dual type is enabled and we have all necessary components, update the composite
                    if (isDualType && maskImage && secondTypeImage) {
                        // Allow a brief delay for the image to fully load
                        setTimeout(updateDualTypeImage, 100);
                    }
                }
            }
        });
    });
    
    // Start observing the card-img container
    const cardImgContainer = document.querySelector('.card-img');
    if (cardImgContainer) {
        cardImgObserver.observe(cardImgContainer, { childList: true });
        console.log("Now watching for image changes");
    } else {
        console.error("Card image container not found");
    }
}

// Initialize dual-type functionality when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing dual-type functionality");
    
    // Wait a brief moment to ensure main scripts have loaded
    setTimeout(function() {
        // Initialize dual-type functionality
        initDualType();
        
        // Intercept large image drop to capture the original source
        interceptLargeImageDrop();
        
        // Check if there's already an image in the card-img container
        const existingImg = document.querySelector('.card-img img');
        if (existingImg && existingImg.src) {
            originalBaseImageSrc = existingImg.src;
            console.log("Found existing image:", originalBaseImageSrc);
        }
    }, 500); // Half-second delay to ensure other scripts are loaded
});

// Export functions for use in other scripts
window.dualType = {
    updateDualTypeImage,
    storeOriginalBaseImage,
    isDualTypeEnabled: () => isDualType
};