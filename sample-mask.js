// Pokemon Card Maker - Sample Masks Extension
// This script adds a dropdown to select from predefined mask patterns using SVG

// Global variables for sample masks functionality
let svgMasks = [
    { 
        name: 'Vertical Split', 
        svg: `<svg width="511" height="711" xmlns="http://www.w3.org/2000/svg">
                <rect width="511" height="355" fill="white"/>
                <rect width="511" height="356" y="355" fill="black"/>
             </svg>`
    },
    { 
        name: 'Horizontal Split', 
        svg: `<svg width="511" height="711" xmlns="http://www.w3.org/2000/svg">
                <rect width="255" height="711" fill="white"/>
                <rect width="256" height="711" x="255" fill="black"/>
             </svg>`
    },
    { 
        name: 'Diagonal Split', 
        svg: `<svg width="511" height="711" xmlns="http://www.w3.org/2000/svg">
                <rect width="511" height="711" fill="white"/>
                <polygon points="0,0 511,711 0,711" fill="black"/>
             </svg>`
    },
    { 
        name: 'Reverse Diagonal', 
        svg: `<svg width="511" height="711" xmlns="http://www.w3.org/2000/svg">
                <rect width="511" height="711" fill="white"/>
                <polygon points="511,0 511,711 0,0" fill="black"/>
             </svg>`
    },
    { 
        name: 'Swirl Pattern', 
        svg: `<svg width="511" height="711" xmlns="http://www.w3.org/2000/svg">
                <rect width="511" height="711" fill="white"/>
                <ellipse cx="255" cy="355" rx="200" ry="280" fill="black"/>
                <ellipse cx="255" cy="355" rx="150" ry="210" fill="white"/>
                <ellipse cx="255" cy="355" rx="100" ry="140" fill="black"/>
                <ellipse cx="255" cy="355" rx="50" ry="70" fill="white"/>
             </svg>`
    },
    { 
        name: 'Wave Pattern', 
        svg: `<svg width="511" height="711" xmlns="http://www.w3.org/2000/svg">
                <rect width="511" height="711" fill="white"/>
                <path d="M0,300 C100,250 150,400 255,350 C360,300 400,450 511,400 L511,711 L0,711 Z" fill="black"/>
             </svg>`
    },
    { 
        name: 'Star Shape', 
        svg: `<svg width="511" height="711" xmlns="http://www.w3.org/2000/svg">
                <rect width="511" height="711" fill="black"/>
                <path d="M255,100 L294,213 L413,213 L317,283 L345,400 L255,330 L165,400 L193,283 L97,213 L216,213 Z" fill="white"/>
             </svg>`
    },
    { 
        name: 'Heart Shape', 
        svg: `<svg width="511" height="711" xmlns="http://www.w3.org/2000/svg">
                <rect width="511" height="711" fill="black"/>
                <path d="M255,400 C355,300 455,350 455,250 C455,150 355,150 255,250 C155,150 55,150 55,250 C55,350 155,300 255,400 Z" fill="white"/>
             </svg>`
    },
    { 
        name: 'Checkerboard', 
        svg: `<svg width="511" height="711" xmlns="http://www.w3.org/2000/svg">
                <rect width="511" height="711" fill="white"/>
                <defs>
                    <pattern id="checkerboard" patternUnits="userSpaceOnUse" width="128" height="128">
                        <rect width="64" height="64" fill="black"/>
                        <rect width="64" height="64" fill="black" x="64" y="64"/>
                    </pattern>
                </defs>
                <rect width="511" height="711" fill="url(#checkerboard)"/>
             </svg>`
    },
    { 
        name: 'Pokeball', 
        svg: `<svg width="511" height="711" xmlns="http://www.w3.org/2000/svg">
                <rect width="511" height="711" fill="black"/>
                <circle cx="255" cy="355" r="200" fill="white"/>
                <rect x="55" y="330" width="400" height="50" fill="black"/>
                <circle cx="255" cy="355" r="60" fill="black"/>
                <circle cx="255" cy="355" r="30" fill="white"/>
             </svg>`
    },
    { 
        name: 'Yin Yang', 
        svg: `<svg width="511" height="711" xmlns="http://www.w3.org/2000/svg">
                <rect width="511" height="711" fill="black"/>
                <circle cx="255" cy="355" r="150" fill="white"/>
                <path d="M255,205 A150,150 0 0,1 255,505 A75,75 0 0,0 255,205" fill="black"/>
                <circle cx="255" cy="280" r="25" fill="black"/>
                <circle cx="255" cy="430" r="25" fill="white"/>
             </svg>`
    }
];

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Find the dual-type container
    const dualTypeContainer = document.getElementById('dual-type-container');
    if (!dualTypeContainer) {
        console.warn("Dual type container not found. Make sure dual-type.js is loaded first.");
        // Wait a bit and try again - the dual-type script might create it after this script loads
        setTimeout(createSampleMasksDropdown, 500);
    } else {
        createSampleMasksDropdown();
    }
    
    // Create SVG container
    createSvgContainer();
});

// Function to create and append sample masks dropdown
function createSampleMasksDropdown() {
    // Find the dual-type container
    const dualTypeContainer = document.getElementById('dual-type-container');
    if (!dualTypeContainer) {
        console.error("Dual type container not found after waiting. Sample masks will not be available.");
        return;
    }

    // Create sample masks container
    const sampleMasksContainer = document.createElement('div');
    sampleMasksContainer.id = 'sample-masks-container';
    sampleMasksContainer.className = 'sample-masks-container hidden';
    
    // Create label and dropdown
    sampleMasksContainer.innerHTML = `
        <label for="sample-masks-select">Sample Masks:</label>
        <select id="sample-masks-select">
            <option value="">Select a mask pattern...</option>
            ${svgMasks.map((mask, index) => `<option value="${index}">${mask.name}</option>`).join('')}
        </select>
    `;
    
    // Insert into the dual type container
    dualTypeContainer.appendChild(sampleMasksContainer);
    
    // Add CSS styles
    addSampleMasksStyles();
    
    // Set up event handlers
    setupSampleMasksHandlers();
    
    // Make visibility function available to dual-type.js
    window.toggleSampleMasksVisibility = toggleSampleMasksVisibility;
}

// Function to create SVG container for rendering
function createSvgContainer() {
    // Create the SVG container (hidden from view but used for rendering)
    const svgContainer = document.createElement('div');
    svgContainer.id = 'svg-mask-container';
    svgContainer.style.display = 'none';
    document.body.appendChild(svgContainer);
}

// Function to add CSS styles for sample masks dropdown
function addSampleMasksStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .sample-masks-container {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-width: 320px;
            margin: 10px auto;
            padding: 8px;
            background: linear-gradient(to bottom, var(--lightblue), var(--darkblue), var(--lightblue));
            border-radius: 8px;
            transition: max-height 0.5s ease, opacity 0.5s ease;
            max-height: 0;
            opacity: 0;
            overflow: hidden;
        }
        
        .sample-masks-container.visible {
            max-height: 50px;
            opacity: 1;
        }
        
        .sample-masks-container label {
            margin-right: 10px;
            color: white;
            text-shadow: 1px 0 1px #177edf, 0 1px 1px #177edf;
            font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
        }
        
        #sample-masks-select {
            flex: 1;
            height: 30px;
            padding: 5px;
            border-radius: 5px;
            border: 1px solid white;
            background-color: white;
            box-shadow: 0 0 15px var(--darkblue) inset;
            font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
        }
        
        #sample-masks-select:focus,
        #sample-masks-select:hover {
            outline: 1px solid var(--yellow);
            border: 1px solid var(--yellow);
            box-shadow: none;
            background-color: white;
        }
        
        .hidden {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
}

// Function to set up event handlers for sample masks dropdown
function setupSampleMasksHandlers() {
    // Find the dual-type toggle to respond to its changes
    const dualTypeToggle = document.getElementById('dual-type-toggle');
    if (dualTypeToggle) {
        dualTypeToggle.addEventListener('change', function() {
            toggleSampleMasksVisibility(this.checked);
        });
    }
    
    // Handle mask selection from dropdown
    const sampleMasksSelect = document.getElementById('sample-masks-select');
    if (sampleMasksSelect) {
        sampleMasksSelect.addEventListener('change', function() {
            const selectedIndex = this.value;
            if (selectedIndex !== '') {
                const selectedMask = svgMasks[selectedIndex];
                convertSvgToImage(selectedMask.svg, function(img) {
                    // Check if these functions exist (from dual-type.js)
                    if (typeof window.maskImage !== 'undefined' && typeof window.updateDualTypeImage === 'function') {
                        // Update the global maskImage variable
                        window.maskImage = img;
                        
                        // Update the dual-type image
                        window.updateDualTypeImage();
                        
                        console.log(`Sample mask "${selectedMask.name}" applied.`);
                    } else {
                        console.error("Dual-type functionality not found. Make sure dual-type.js is loaded properly.");
                    }
                });
            }
        });
    }
    
    // Add event handler to the mask drop zone to reset dropdown
    const maskDropZone = document.querySelector('.img-drop-mask');
    if (maskDropZone) {
        maskDropZone.addEventListener('drop', function() {
            const sampleMasksSelect = document.getElementById('sample-masks-select');
            if (sampleMasksSelect) {
                // Reset dropdown to default option after a custom mask is dropped
                sampleMasksSelect.value = '';
            }
        }, false);
    }
}

// Function to toggle visibility of sample masks dropdown
function toggleSampleMasksVisibility(visible) {
    const sampleMasksContainer = document.getElementById('sample-masks-container');
    if (sampleMasksContainer) {
        sampleMasksContainer.classList.toggle('hidden', !visible);
        setTimeout(() => {
            sampleMasksContainer.classList.toggle('visible', visible);
        }, 10); // Small delay for the transition to work
    }
}

// Function to convert SVG to an Image object
function convertSvgToImage(svgString, callback) {
    // Get the SVG container
    const svgContainer = document.getElementById('svg-mask-container');
    if (!svgContainer) {
        console.error("SVG container not found");
        return;
    }
    
    // Set the SVG content
    svgContainer.innerHTML = svgString;
    
    // Get the SVG element
    const svgElement = svgContainer.querySelector('svg');
    if (!svgElement) {
        console.error("SVG element not found in container");
        return;
    }
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to match SVG
    canvas.width = parseInt(svgElement.getAttribute('width'));
    canvas.height = parseInt(svgElement.getAttribute('height'));
    
    // Create a data URL from the SVG
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    // Create an image from the SVG
    const img = new Image();
    img.onload = function() {
        // Draw the image to the canvas
        ctx.drawImage(img, 0, 0);
        
        // Get data URL from canvas
        try {
            // Create a new image from the canvas
            const resultImg = new Image();
            resultImg.onload = function() {
                // Clean up
                URL.revokeObjectURL(url);
                svgContainer.innerHTML = '';
                
                // Return the image
                callback(resultImg);
            };
            resultImg.src = canvas.toDataURL('image/png');
        } catch (e) {
            console.error("Error converting SVG to PNG:", e);
            
            // Fallback: Use the SVG image directly
            URL.revokeObjectURL(url);
            callback(img);
        }
    };
    img.onerror = function() {
        console.error("Error loading SVG into image");
        URL.revokeObjectURL(url);
    };
    img.src = url;
}

// Create default mask.png from SVG if needed
function createDefaultMask() {
    // Use the vertical split as the default mask
    const defaultMaskSvg = svgMasks[0].svg;
    
    convertSvgToImage(defaultMaskSvg, function(img) {
        // Convert to data URL
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        
        // Create download link
        const link = document.createElement('a');
        link.download = 'mask.png';
        link.href = dataURL;
        link.click();
        
        console.log("Default mask.png has been created and downloaded.");
    });
}

// Export the createDefaultMask function
window.createDefaultMask = createDefaultMask;

// Function to export any of the SVG masks as PNG
function exportMaskAsPNG(maskIndex, filename) {
    if (!svgMasks[maskIndex]) {
        console.error("Mask not found at index:", maskIndex);
        return;
    }
    
    const maskSvg = svgMasks[maskIndex].svg;
    const maskName = filename || `${svgMasks[maskIndex].name.toLowerCase().replace(/\s+/g, '-')}.png`;
    
    convertSvgToImage(maskSvg, function(img) {
        // Convert to data URL
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        
        // Create download link
        const link = document.createElement('a');
        link.download = maskName;
        link.href = dataURL;
        link.click();
        
        console.log(`Mask "${svgMasks[maskIndex].name}" has been exported as "${maskName}".`);
    });
}

// Export the exportMaskAsPNG function
window.exportMaskAsPNG = exportMaskAsPNG;

// Function to export all SVG masks as PNGs
function exportAllMasks() {
    console.log("Exporting all masks as PNG files...");
    
    svgMasks.forEach((mask, index) => {
        setTimeout(() => {
            exportMaskAsPNG(index);
        }, index * 500); // Stagger exports to avoid browser issues
    });
}

// Export the exportAllMasks function
window.exportAllMasks = exportAllMasks;

// Add console instructions after initialization
setTimeout(function() {
    console.log("%c Pokemon Card Maker - Sample Masks ", "background: #177edf; color: white; padding: 5px; border-radius: 5px;");
    console.log("Available functions:");
    console.log("- window.createDefaultMask() - Creates and downloads a default mask.png");
    console.log("- window.exportMaskAsPNG(maskIndex, [filename]) - Exports a specific mask as PNG");
    console.log("- window.exportAllMasks() - Exports all masks as PNG files");
}, 1000);