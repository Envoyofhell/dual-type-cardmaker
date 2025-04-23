// Card download functionality using Canvas API for compositing
// Requires html2canvas: <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>

document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('temp')) {
        const tempContainer = document.createElement('div');
        tempContainer.id = 'temp';
        // Style the temp container for consistent capture base
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px'; // Keep offscreen
        tempContainer.style.top = '0px'; // Position at top-left for consistency
        tempContainer.style.visibility = 'hidden';
        // Set explicit size for the container html2canvas will target
        tempContainer.style.width = '747px'; // Base card width
        tempContainer.style.height = '1038px'; // Base card height
        tempContainer.style.overflow = 'hidden'; // Prevent clone overflow affecting size
        tempContainer.style.margin = '0';
        tempContainer.style.padding = '0';
        document.body.appendChild(tempContainer);
    }
    setupDownloadButton();
});

function setupDownloadButton() {
     let downloadBtn = document.getElementById('download-card-btn');
     if (!downloadBtn) {
         addDownloadButton();
         downloadBtn = document.getElementById('download-card-btn');
     }
     if (downloadBtn && !downloadBtn.getAttribute('listenerAttached')) {
          downloadBtn.addEventListener('click', showPreviewModal);
          downloadBtn.setAttribute('listenerAttached', 'true');
     }
}

function addDownloadButton() {
    const container = document.querySelector('.img-drop-container');
    if (!container || document.getElementById('download-card-btn')) return;
    const downloadBtn = document.createElement('button');
    downloadBtn.id = 'download-card-btn';
    downloadBtn.innerHTML = 'Download Card';
    downloadBtn.className = 'download-btn action-button';
    let buttonArea = container.querySelector('.action-buttons');
    if (!buttonArea) {
        buttonArea = container;
        buttonArea.style.marginTop = '15px';
    }
    buttonArea.appendChild(downloadBtn);
    // Listener added in setupDownloadButton
}


function showPreviewModal() {
    // (Modal creation logic remains the same - shows preview using cloned DOM)
    const existingModal = document.querySelector('.card-preview-modal');
    if (existingModal) existingModal.remove();
    const modal = document.createElement('div');
    modal.className = 'card-preview-modal';
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    const title = document.createElement('h2');
    title.textContent = 'Card Preview';
    title.style.marginBottom = '15px';
    title.style.color = '#177edf';
    modalContent.appendChild(title);
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';
    const originalCard = document.querySelector('#card');
    if (!originalCard) { alert('Card element not found!'); return; }
    const cardAspectRatio = 747 / 1038;
    const previewWidth = Math.min(window.innerWidth * 0.4, 400);
    const previewHeight = previewWidth / cardAspectRatio;
    const cardClone = originalCard.cloneNode(true);
    cardClone.id = 'card-preview';
    cardClone.style.width = `${previewWidth}px`;
    cardClone.style.height = `${previewHeight}px`;
    cardClone.style.margin = '0 auto';
    cardClone.style.position = 'relative';
    const cardContainer = cardClone.querySelector('.card-container');
    if (cardContainer) cardContainer.style.display = 'block';
    previewContainer.appendChild(cardClone);
    modalContent.appendChild(previewContainer);
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
    downloadButton.addEventListener('click', () => {
         downloadButton.textContent = 'Generating...';
         downloadButton.disabled = true;
         downloadCardWithCanvas() // Trigger canvas download
            .catch(err => {
                console.error("Error during canvas download process:", err);
                alert("Failed to generate card image. See console for details.");
            })
            .finally(() => {
                 const modalToClose = document.querySelector('.card-preview-modal');
                 if(modalToClose) document.body.removeChild(modalToClose);
            });
    });
    cancelButton.addEventListener('click', () => document.body.removeChild(modal));
    modal.addEventListener('click', (e) => { if (e.target === modal) document.body.removeChild(modal); });
    buttonContainer.appendChild(downloadButton);
    buttonContainer.appendChild(cancelButton);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    fixCardPreviewFormatting(cardClone); // Still useful for modal preview
}

// (fixCardPreviewFormatting remains the same)
function fixCardPreviewFormatting(cardPreview){const cardContainer=cardPreview.querySelector(".card-container");cardContainer&&(cardContainer.style.display="block",cardContainer.style.position="relative",cardContainer.style.zIndex="5");const cardTop=cardPreview.querySelector(".card-top");cardTop&&(cardTop.style.position="relative",cardTop.style.zIndex="6");const cardBottom=cardPreview.querySelector(".card-bottom");cardBottom&&(cardBottom.style.position="relative",cardBottom.style.zIndex="6");const cardName=cardPreview.querySelector(".card-name");cardName&&(cardName.style.position="relative",cardName.style.fontSize="min(33.6px, 2.1vw)",cardName.style.transform="scaleX(0.9) translateX(-7%)",cardName.style.zIndex="7");const hpContainer=cardPreview.querySelector(".hp-container");hpContainer&&(hpContainer.style.position="relative",hpContainer.style.top="0.1vw",hpContainer.style.zIndex="7");const cardHp=cardPreview.querySelector(".card-hp");cardHp&&(cardHp.style.position="relative",cardHp.style.fontSize="min(4.8px, 0.3vw)",cardHp.style.fontFamily="'Lato', 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",cardHp.style.display="inline-block",cardHp.style.left="0.35vw");const hp=cardPreview.querySelector(".hp");hp&&(hp.style.fontSize="min(28.8px, 1.8vw)",hp.style.fontFamily="'Plus Jakarta Sans', sans-serif",hp.style.transform="scaleX(0.9) translateX(5%)",hp.style.fontWeight="bold",hp.style.display="inline-block");const attacks=cardPreview.querySelectorAll(".attack");attacks.forEach((e=>{e.style.position="relative",e.style.zIndex="7"}));const footer=cardPreview.querySelector(".card-footer");footer&&(footer.style.position="relative",footer.style.zIndex="7");const hiddenElements=cardPreview.querySelectorAll('[style*="display: none"]');hiddenElements.forEach((e=>{const t=document.getElementById("stage")?.value||"basic";(e.classList.contains("small-img")&&"basic"===t||e.classList.contains("evolves-from")&&"basic"===t)&&!e.closest(".input-body")||"0px"===e.closest(".input-body")?.style.height||(e.style.display="block")}))} // Minified


// --- Canvas Download Logic with Alignment Fix ---

async function downloadCardWithCanvas() {
    const originalCard = document.getElementById('card');
    if (!originalCard) throw new Error('Original card element #card not found');

    const tempContainer = document.getElementById('temp'); // Use the pre-styled temp container
    if (!tempContainer) throw new Error('Temporary container #temp not found');
    tempContainer.innerHTML = ''; // Clear previous

    // --- Configuration ---
    const scaleFactor = 2;
    const baseWidth = 747; // Base dimensions for layout
    const baseHeight = 1038;
    const targetWidth = baseWidth * scaleFactor; // Final canvas size
    const targetHeight = baseHeight * scaleFactor;
    const isDual = window.dualTypeSimple?.isDualTypeEnabled ? window.dualTypeSimple.isDualTypeEnabled() : false;
    const maskUrl = window.dualTypeSimple?.getCurrentMaskUrl ? window.dualTypeSimple.getCurrentMaskUrl() : null;
     // Determine if we use image mask or default clip-path visual
    const useSpecificMask = isDual && maskUrl && maskUrl !== 'img/mask.png';

    // --- html2canvas options (consistent for all captures) ---
    const captureOptions = {
        scale: scaleFactor,
        allowTaint: true,
        useCORS: true,
        backgroundColor: null, // Capture transparency
        logging: true,
        // Capture the temp container, which has fixed dimensions
        width: baseWidth,
        height: baseHeight,
        x: 0, // Capture from top-left of temp container
        y: 0,
        // scrollX/Y are relative to the window, capture is relative to element
        scrollX: 0, // Assume temp container is not scrolled
        scrollY: 0,
        windowWidth: baseWidth, // Tell html2canvas the "window" size is the container size
        windowHeight: baseHeight
    };

    // --- Create final canvas ---
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // --- Helper to capture a layer inside the fixed temp container ---
    const captureLayer = async (prepareFn) => {
        const clone = originalCard.cloneNode(true);
        clone.id = `capture-clone-${Date.now()}`;
        // Style the clone to fit exactly within the temp container
        clone.style.width = `${baseWidth}px`;
        clone.style.height = `${baseHeight}px`;
        clone.style.position = 'absolute'; // Position top-left within temp
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.margin = '0'; // No margin/padding
        clone.style.padding = '0';
        clone.style.boxShadow = 'none';
        clone.style.transform = 'none';

        if (prepareFn) {
             prepareFn(clone); // Apply specific preparations (hide/show elements)
        }

        tempContainer.innerHTML = ''; // Clear previous clone
        tempContainer.appendChild(clone);
        // Make temp container visible for capture (it's offscreen anyway)
        tempContainer.style.visibility = 'visible';

        // Delay slightly for rendering
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            // Capture the tempContainer, which contains the positioned clone
            const canvas = await html2canvas(tempContainer, {
                ...captureOptions,
                 onclone: (clonedDoc) => {
                     const clonedTarget = clonedDoc.getElementById('temp'); // Target the container in the clone doc
                     const clonedCard = clonedTarget?.querySelector(`#${clone.id}`); // Find the card within
                    if(clonedCard && prepareFn) {
                         console.log("Re-preparing clone inside onclone");
                         prepareFn(clonedCard);
                    }
                     // Ensure body margin is 0 in the iframe
                     if(clonedDoc.body) clonedDoc.body.style.margin = '0';
                }
            });
             return canvas; // Return the captured canvas
        } catch(error) {
            console.error("html2canvas capture error:", error);
            throw error;
        } finally {
             // Clean up regardless of success/failure
             tempContainer.innerHTML = '';
             tempContainer.style.visibility = 'hidden';
        }
    };

    // --- Capture Stages ---
    try {
        // 1. Capture Base Card (hide second layer)
        console.log("Capturing Base Card Layer...");
        const baseCanvas = await captureLayer((clone) => {
            const secondLayer = clone.querySelector('#second-card-layer');
            if (secondLayer) secondLayer.style.display = 'none';
             const bgLayer = clone.querySelector('#custom-bg-layer');
             if (bgLayer) bgLayer.style.display = 'block';
             // Ensure base styles are present
             clone.style.backgroundImage = window.getComputedStyle(originalCard).backgroundImage;
             clone.style.backgroundSize = window.getComputedStyle(originalCard).backgroundSize;
             clone.style.backgroundRepeat = window.getComputedStyle(originalCard).backgroundRepeat;
             clone.style.backgroundPosition = window.getComputedStyle(originalCard).backgroundPosition;
        });
        console.log("Base Card Layer Captured.");

        // 2. Capture Second Layer (if dual type, make ONLY it visible within card area)
        let secondCanvas = null;
        if (isDual) {
            console.log("Capturing Second Type Layer (unmasked)...");
            secondCanvas = await captureLayer((clone) => {
                 // Make clone background transparent
                 clone.style.backgroundImage = 'none';
                 clone.style.backgroundColor = 'transparent';

                 // Hide everything EXCEPT the second layer's background
                Array.from(clone.children).forEach(child => {
                     if (child.id !== 'second-card-layer') {
                          child.style.visibility = 'hidden';
                          child.style.display = 'none';
                     }
                });
                 const secondLayer = clone.querySelector('#second-card-layer');
                 if(secondLayer) {
                    secondLayer.style.visibility = 'visible';
                    secondLayer.style.display = 'block';
                    // Ensure BG is set, remove mask/clip
                    const originalSecondLayer = document.getElementById('second-card-layer');
                    if (originalSecondLayer) {
                         secondLayer.style.backgroundImage = originalSecondLayer.style.backgroundImage;
                         secondLayer.style.backgroundSize = originalSecondLayer.style.backgroundSize || 'contain';
                         secondLayer.style.backgroundRepeat = originalSecondLayer.style.backgroundRepeat || 'no-repeat';
                         secondLayer.style.backgroundPosition = originalSecondLayer.style.backgroundPosition || 'center';
                    }
                    secondLayer.style.maskImage = 'none';
                    secondLayer.style.webkitMaskImage = 'none';
                    secondLayer.style.clipPath = 'none';
                    secondLayer.style.webkitClipPath = 'none';
                 }
            });
            console.log("Second Type Layer Captured.");
        }

        // 3. Load Mask Image (if needed)
        let maskImage = null;
        if (useSpecificMask && maskUrl) {
             console.log("Loading Mask Image:", maskUrl);
             maskImage = await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => { console.log("Mask Image Loaded."); resolve(img); };
                img.onerror = (err) => { console.error("Mask Image Load Error:", err); reject(new Error("Failed to load mask image")); };
                img.src = maskUrl;
             });
        }

        // --- Composite on Final Canvas ---
        console.log("Compositing layers...");
        ctx.clearRect(0, 0, targetWidth, targetHeight);

        // Draw Base
        ctx.drawImage(baseCanvas, 0, 0, targetWidth, targetHeight);
        console.log("Base layer drawn.");

        // Draw Second Layer and Apply Mask/Clip
        if (secondCanvas) {
             console.log("Drawing and masking second layer...");
             const tempMaskCanvas = document.createElement('canvas');
             tempMaskCanvas.width = targetWidth;
             tempMaskCanvas.height = targetHeight;
             const tempCtx = tempMaskCanvas.getContext('2d');
             if (!tempCtx) throw new Error('Could not get temp canvas context');

             tempCtx.drawImage(secondCanvas, 0, 0, targetWidth, targetHeight); // Draw unmasked second layer

             // Apply mask/clip
             tempCtx.globalCompositeOperation = useSpecificMask && maskImage ? 'destination-in' : 'destination-in'; // destination-in works for both alpha mask and shape mask

             if (useSpecificMask && maskImage) {
                  console.log("Applying image mask...");
                  tempCtx.drawImage(maskImage, 0, 0, targetWidth, targetHeight);
             } else { // Apply default clip-path shape as mask
                  console.log("Applying default clip-path mask...");
                  tempCtx.beginPath();
                  tempCtx.moveTo(0, 0);
                  tempCtx.lineTo(targetWidth, 0);
                  tempCtx.lineTo(0, targetHeight);
                  tempCtx.closePath();
                  tempCtx.fillStyle = "black"; // Color doesn't matter for destination-in with shape
                  tempCtx.fill();
             }
             tempCtx.globalCompositeOperation = 'source-over'; // Reset before drawing

             // Draw the masked result onto the final canvas
             ctx.drawImage(tempMaskCanvas, 0, 0, targetWidth, targetHeight);
             console.log("Second layer masked and drawn.");
        }

        // --- Trigger Download ---
        console.log("Generating final image data URL...");
        const imgData = finalCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        const pokemonName = document.getElementById('name')?.value || 'pokemon';
        const fileName = pokemonName.trim() ? `${pokemonName.trim()}-card.png` : 'pokemon-card.png';
        link.href = imgData;
        link.download = fileName;
        link.click();
        console.log("Download initiated.");

    } catch (error) {
        console.error('Error during canvas compositing or download:', error);
        alert(`Failed to generate card image: ${error.message || error}. Check console for details.`);
    }
    // No finally block needed here as cleanup happens in captureLayer or the modal handler
}