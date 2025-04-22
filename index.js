// Global variables
let currentType = 'water',
    pastType = '',
    weakness = '',
    resistance = '',
    pastStage = '',
    maskImage = null,        // New: For dual-type mask
    secondTypeImage = null,  // New: For second type image
    originalBaseImageSrc = null, // New: To store original base image src
    isDualType = false;      // New: Flag for dual-type mode

// jQuery Alias (if needed, ensure jQuery is loaded in your HTML)
const $ = window.jQuery; // Or your specific way of accessing jQuery if using modules

// ******** DUAL TYPE IMAGE COMPOSITING FUNCTIONS ********

// Function to composite images using a mask
function compositeImages(baseImage, overlayImage, maskImage) {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match the images
    // Ensure dimensions are valid
    canvas.width = baseImage.naturalWidth || baseImage.width;
    canvas.height = baseImage.naturalHeight || baseImage.height;
    if (canvas.width === 0 || canvas.height === 0) {
        console.error("Base image has zero dimensions.");
        return null; // Cannot composite
    }


    // Draw the base image
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height); // Draw base scaled to canvas

    // Set the global composite operation for mask application
    ctx.globalCompositeOperation = 'destination-in';

    // Draw the mask (will keep only the parts of base image where mask is white)
    ctx.drawImage(maskImage, 0, 0, canvas.width, canvas.height); // Draw mask scaled to canvas

    // Create a second canvas for the overlay image
    const canvas2 = document.createElement('canvas');
    const ctx2 = canvas2.getContext('2d');

    // Set second canvas dimensions like the first one
    canvas2.width = canvas.width;
    canvas2.height = canvas.height;

    // Draw the overlay image onto the second canvas
    ctx2.drawImage(overlayImage, 0, 0, canvas2.width, canvas2.height); // Draw overlay scaled to canvas

    // Apply inverse mask to overlay image using destination-in
    ctx2.globalCompositeOperation = 'destination-in';

    // Create inverted mask on a temporary canvas
    const invertCanvas = document.createElement('canvas');
    const invertCtx = invertCanvas.getContext('2d');
    invertCanvas.width = maskImage.naturalWidth || maskImage.width; // Use mask's natural dimensions
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
    ctx.globalCompositeOperation = 'source-over'; // Or 'lighter' if additive blending is desired

    // Draw the masked overlay (canvas2) onto the masked base (canvas)
    ctx.drawImage(canvas2, 0, 0);

    // Return the composited image as a data URL
    return canvas.toDataURL();
}

// Function to create and display the composite image
function updateDualTypeImage() {
    // Check if we have all the images we need AND the original base source
    if (!maskImage || !secondTypeImage || !originalBaseImageSrc) {
        console.warn("Missing images or original base source for dual type update.");
        return;
    }

    const baseImgElement = new Image();
    baseImgElement.src = originalBaseImageSrc; // Use the stored original source

    baseImgElement.onload = function() {
        // Ensure maskImage and secondTypeImage are also loaded and valid Image objects
        if (!maskImage.complete || maskImage.naturalHeight === 0 || !secondTypeImage.complete || secondTypeImage.naturalHeight === 0) {
             console.error("Mask or Second Type image not loaded properly for compositing.");
             return; // Prevent errors if images aren't ready
        }

        // Create the composite image
        const compositeSrc = compositeImages(baseImgElement, secondTypeImage, maskImage);

        if (compositeSrc) {
            // Update the card image
            const newImg = document.createElement('img');
            newImg.src = compositeSrc;
            document.querySelector('.card-img').replaceChildren(newImg);
        } else {
            console.error("Compositing failed.")
        }
    };
    baseImgElement.onerror = function() {
        console.error("Failed to load base image for compositing from src:", originalBaseImageSrc);
    }
}


// ******** IMAGE DRAG & DROP FUNCTIONS ********

// LARGE IMG (BASE IMAGE)
const largeImgDrop = document.querySelector('.img-drop');

largeImgDrop.addEventListener('dragenter', event => {
    event.preventDefault();
    largeImgDrop.classList.add('active');
});

largeImgDrop.addEventListener('dragleave', event => {
    event.preventDefault();
    largeImgDrop.classList.remove('active');
});

largeImgDrop.addEventListener('dragover', event => {
    event.preventDefault();
});

largeImgDrop.addEventListener('drop', event => {
    event.preventDefault();
    largeImgDrop.classList.remove('active');
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) { // Basic file type check
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.addEventListener('loadend', () => {
            const img = document.createElement('img');
            img.src = reader.result;
            originalBaseImageSrc = img.src; // Store the original source
            document.querySelector('.card-img').replaceChildren(img);
            if (isDualType) {
                updateDualTypeImage(); // Update composite if dual type is active
            }
        });
         reader.onerror = () => {
            console.error("Error reading dropped base image file.");
            // Optionally display an error to the user
        };
    } else {
        console.warn("Dropped file is not an image or no file dropped.");
         // Optionally notify the user
    }
});

// SMALL IMG (EVOLUTION STAGE)
const smallImgDrop = document.querySelector('.img-drop-small');

smallImgDrop.addEventListener('dragenter', event => {
    event.preventDefault();
    smallImgDrop.classList.add('active');
});

smallImgDrop.addEventListener('dragleave', event => {
    event.preventDefault();
    smallImgDrop.classList.remove('active');
});

smallImgDrop.addEventListener('dragover', event => {
    event.preventDefault();
});

smallImgDrop.addEventListener('drop', event => {
    event.preventDefault();
    smallImgDrop.classList.remove('active');
    const file = event.dataTransfer.files[0];
     if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.addEventListener('loadend', () => {
            const img = document.createElement('img');
            img.src = reader.result;
            document.querySelector('.small-img').replaceChildren(img);
        });
         reader.onerror = () => {
            console.error("Error reading dropped small image file.");
        };
    } else {
         console.warn("Dropped file is not an image or no file dropped for small image.");
    }
});

// MASK IMG (FOR DUAL TYPE)
const maskImgDrop = document.querySelector('.img-drop-mask');

if (maskImgDrop) { // Check if the element exists before adding listeners
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
                const img = new Image(); // Use Image object for onload check
                img.onload = function() {
                    maskImage = img; // Store the loaded Image object
                    console.log("Mask image loaded.");
                    if (isDualType) updateDualTypeImage();
                };
                 img.onerror = function() {
                     console.error("Error loading mask image from data URL.");
                     maskImage = null; // Reset if loading failed
                 }
                img.src = reader.result;
            });
             reader.onerror = () => {
                console.error("Error reading dropped mask file.");
            };
        } else {
            console.warn("Dropped file is not an image or no file dropped for mask.");
        }
    });
} else {
    console.warn("Element with class '.img-drop-mask' not found.");
}


// SECOND TYPE IMG (FOR DUAL TYPE)
const secondImgDrop = document.querySelector('.img-drop-second');

if (secondImgDrop) { // Check if the element exists
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
                const img = new Image(); // Use Image object
                img.onload = function() {
                    secondTypeImage = img; // Store the loaded Image object
                    console.log("Second type image loaded.");
                    if (isDualType) updateDualTypeImage();
                };
                 img.onerror = function() {
                     console.error("Error loading second type image from data URL.");
                     secondTypeImage = null; // Reset if loading failed
                 }
                img.src = reader.result;
            });
            reader.onerror = () => {
                console.error("Error reading dropped second type file.");
            };
        } else {
            console.warn("Dropped file is not an image or no file dropped for second type.");
        }
    });
} else {
    console.warn("Element with class '.img-drop-second' not found.");
}


// ******** DUAL TYPE TOGGLE ********
const dualTypeToggle = document.getElementById('dual-type-toggle');

if (dualTypeToggle) { // Check if the element exists
    dualTypeToggle.addEventListener('change', function() {
        isDualType = this.checked;
        if (isDualType) {
            console.log("Dual Type Enabled");
            // Attempt to update immediately if possible
            updateDualTypeImage();
        } else {
            console.log("Dual Type Disabled");
            // Revert to single type display using the stored original source
            const cardImgContainer = document.querySelector('.card-img');
            if (originalBaseImageSrc && cardImgContainer) {
                 // Check if there's an image element to update, otherwise create one
                 let imgElement = cardImgContainer.querySelector('img');
                 if (!imgElement) {
                     imgElement = document.createElement('img');
                 }
                 imgElement.src = originalBaseImageSrc;
                 cardImgContainer.replaceChildren(imgElement); // Replace with the original image
            } else if (cardImgContainer) {
                // If no original src, maybe clear the image?
                cardImgContainer.replaceChildren(); // Clear content if no original source
                console.warn("No original base image source available to revert to.")
            }
        }
    });
} else {
    console.warn("Element with id 'dual-type-toggle' not found.");
}


// ******* CARD CONTENT UPDATE FUNCTION *******

function updateContent() {
    // --- Basic Info ---
    document.querySelector('.card-name').innerHTML = $('input[type=text][name=name]').val() || 'Pokemon Name';

    const hp = $('input[name=hp]').val();
    if (hp !== '') {
        document.querySelector('.hp').innerHTML = hp;
        document.querySelector('.card-hp').innerHTML = 'HP';
    } else {
        document.querySelector('.hp').innerHTML = '';
        document.querySelector('.card-hp').innerHTML = '';
    }

    // --- Evolution Info ---
    const stage = $('select[name=stage]').val();
    const preEvolution = $('input[name=evolves-from]').val();

    if (stage === 'basic') {
        document.querySelector('.small-img').style.display = 'none';
        document.querySelector('.evolves-from').style.display = 'none';
        document.getElementById('evolves-from-name').innerHTML = '';
    } else {
        document.querySelector('.small-img').style.display = 'block';
        document.querySelector('.evolves-from').style.display = 'block';
        if (preEvolution !== '') {
            document.getElementById('evolves-from-name').innerHTML = 'Evolves from ' + preEvolution;
        } else {
            document.getElementById('evolves-from-name').innerHTML = 'Evolves from...'; // Placeholder
        }
    }

    // --- Pokedex Info ---
    const pokedex = $('input[name=pokedex-number]').val();
    if (pokedex !== '') {
        document.querySelector('.pokedex-number').innerHTML = 'NO. ' + pokedex;
    } else {
         document.querySelector('.pokedex-number').innerHTML = '';
    }

    const category = $('input[name=category]').val();
    if (category !== '') {
        document.querySelector('.category').innerHTML = category + ' Pokemon';
    } else {
         document.querySelector('.category').innerHTML = '';
    }

    const heightInches = $('input[name=inches]').val();
    const heightFeet = $('input[name=feet]').val();
    if (heightInches !== '' || heightFeet !== '') {
        document.querySelector('.height').innerHTML = `HT: ${heightFeet || 0}'${heightInches || 0}"`;
    } else {
        document.querySelector('.height').innerHTML = '';
    }

    const weight = $('input[name=weight]').val();
    if (weight !== '') {
        document.querySelector('.weight').innerHTML = `WT: ${weight} lbs.`;
    } else {
        document.querySelector('.weight').innerHTML = '';
    }

    // --- Card Styling (Type and Stage) ---
    if (currentType !== '') {
        // Remove previous type/stage class
        if (pastType !== '' && pastStage !== '') {
             try { // Add try-catch for safety if classes are complex/dynamic
                document.getElementById('card').classList.remove(`card-${pastType}-${pastStage}`);
             } catch (e) {
                 console.warn("Could not remove old class:", `card-${pastType}-${pastStage}`, e);
             }
        }
         // Add new type/stage class
         try {
            document.getElementById('card').classList.add(`card-${currentType}-${stage}`);
         } catch(e) {
             console.warn("Could not add new class:", `card-${currentType}-${stage}`, e);
         }


        pastType = currentType; // Update pastType *after* using it
    }
    pastStage = stage; // Update pastStage *after* using it

    // --- Dark Mode Text Color ---
    // Consider making this CSS-based for better separation
    if (currentType == 'dark') {
        document.querySelector('body').style.color = 'white'; // Careful: affects whole body
    } else {
        document.querySelector('body').style.color = '#000'; // Reset color
    }

    // --- Ability and Attacks ---
    const abilityElement = createAbility(); // Will return undefined if no name
    const attack1Element = createAttack1(); // Always returns an element
    const attack2Element = createAttack2(); // Always returns an element

    // Clear previous attacks/ability and add new ones
    // Use an array filter to remove null/undefined elements before replacing
    const elementsToAdd = [abilityElement, attack1Element, attack2Element].filter(Boolean);
    document.querySelector('.attack-container').replaceChildren(...elementsToAdd);

    // --- Weakness, Resistance, Retreat ---
    updateWeaknessResistanceRetreat();

    // --- Show Card ---
    document.querySelector('.card-container').style.display = 'block';
    // document.querySelector('#card').classList.remove('card'); // Seems potentially problematic, review purpose

    // --- Recursive Call (BE CAREFUL!) ---
    // This setTimeout(updateContent, 333) creates a potentially infinite loop
    // It will re-run updateContent every 333ms regardless of whether input changed.
    // This is very inefficient and can cause issues.
    // It should likely be removed and updateContent should only be called when an input value *actually changes*.
    // Commenting it out for now. If you need periodic updates, consider a different approach.
    // setTimeout(() => {
    //     updateContent()
    // }, 333);
}

// Helper for W/R/R updates
function updateWeaknessResistanceRetreat() {
    const weaknessImgContainer = document.getElementById('weakness-img');
    const weaknessNumberEl = document.querySelector('.weakness-number');
    if (weakness !== '' && weaknessImgContainer && weaknessNumberEl) {
        const weakImg = document.createElement('img');
        weakImg.setAttribute('src', 'img/' + weakness + '.png');
        weakImg.setAttribute('alt', weakness + ' type'); // Add alt text
        weaknessImgContainer.replaceChildren(weakImg);
        weaknessNumberEl.innerHTML = '×2';
    } else if (weaknessImgContainer && weaknessNumberEl) {
        weaknessImgContainer.replaceChildren('');
        weaknessNumberEl.innerHTML = '';
    }

    const resistanceImgContainer = document.getElementById('resistance-img');
    const resistanceNumberEl = document.querySelector('.resistance-number');
    if (resistance !== '' && resistanceImgContainer && resistanceNumberEl) {
        const resistImg = document.createElement('img');
        resistImg.setAttribute('src', 'img/' + resistance + '.png');
        resistImg.setAttribute('alt', resistance + ' type'); // Add alt text
        resistanceImgContainer.replaceChildren(resistImg);
        resistanceNumberEl.innerHTML = '-30';
    } else if (resistanceImgContainer && resistanceNumberEl) {
        resistanceImgContainer.replaceChildren('');
        resistanceNumberEl.innerHTML = '';
    }

    const retreat = $('select[name=retreat]').val();
    const retreatImgContainer = document.getElementById('retreat-img');
    if (retreatImgContainer) {
        retreatImgContainer.replaceChildren(''); // Clear existing
        for (let i = retreat; i > 0; i--) {
            const img = document.createElement('img');
            img.setAttribute('src', 'img/normal.png'); // Assuming 'normal' is colorless cost
             img.setAttribute('alt', 'Retreat cost'); // Add alt text
            retreatImgContainer.appendChild(img);
        }
    }
}


// ***************** INPUT MENU BARS (Accordion Logic) *****************

function toggleAccordion(dropdownId, bodyId, arrowId, openHeight) {
    const dropdown = document.getElementById(dropdownId);
    const body = document.getElementById(bodyId);
    const arrow = document.getElementById(arrowId);

    if (!dropdown || !body || !arrow) {
        console.error("Missing elements for accordion:", dropdownId, bodyId, arrowId);
        return;
    }

    const isClosed = dropdown.classList.contains('closed');

    if (isClosed) {
        body.style.height = openHeight; // Set target height
        body.classList.add('border-bottom');
        dropdown.classList.remove('closed');
        dropdown.classList.add('opened');
        arrow.classList.remove('down');
        arrow.classList.add('up');
        // Allow overflow after transition for dropdowns inside
        if (bodyId === 'attack1' || bodyId === 'attack2') {
            setTimeout(() => {
                body.style.overflow = 'visible';
            }, 300); // Match transition duration
        }
    } else {
        body.style.height = '0';
        body.style.overflow = 'hidden'; // Hide overflow during closing
        body.classList.remove('border-bottom');
        dropdown.classList.remove('opened');
        dropdown.classList.add('closed');
        arrow.classList.remove('up');
        arrow.classList.add('down');
    }
}

// --- Setup Accordion Listeners ---
document.getElementById('stage-dropdown')?.addEventListener('click', () => toggleAccordion('stage-dropdown', 'stage-body', 'stage-arrow', '85px'));
document.getElementById('stats-dropdown')?.addEventListener('click', () => toggleAccordion('stats-dropdown', 'stats-body', 'stats-arrow', '150px'));
document.getElementById('ability-dropdown')?.addEventListener('click', () => toggleAccordion('ability-dropdown', 'ability-body', 'ability-arrow', '140px'));
document.getElementById('attack-1-dropdown')?.addEventListener('click', () => toggleAccordion('attack-1-dropdown', 'attack1', 'attack-1-arrow', '260px'));
document.getElementById('attack-2-dropdown')?.addEventListener('click', () => toggleAccordion('attack-2-dropdown', 'attack2', 'attack-2-arrow', '260px'));


// ******** TYPE DROPDOWN LISTS (Energy/Weakness/Resistance Selectors) ********
const attack1label = document.querySelector('.attack-1-label');
const attack2label = document.querySelector('.attack-2-label');
const weaknessLabel = document.querySelector('.weakness-label');
const resistanceLabel = document.querySelector('.resistance-label');

// Close dropdowns if clicking outside
window.addEventListener('click', function (e) {
    // Check if the click is outside any element with class 'dropdown-container'
    if (!e.target.closest('.dropdown-container')) {
        document.querySelectorAll('.dropdown').forEach(drop => {
            if (drop.style.display === 'block') { // Check if it's actually visible
                const buttonArrow = drop.parentElement?.nextElementSibling?.firstElementChild;
                drop.style.display = 'none';
                if (buttonArrow) {
                     buttonArrow.classList.remove('up');
                     buttonArrow.classList.add('down');
                }
                // Find the corresponding label and remove focus class
                 // This part is tricky without a direct link; assuming structure based on original code
                 if (drop.id.includes('attack-cost-list-1')) attack1label?.classList.remove('focused');
                 else if (drop.id.includes('attack-cost-list-2')) attack2label?.classList.remove('focused');
                 else if (drop.id === 'weakness-list') weaknessLabel?.classList.remove('focused');
                 else if (drop.id === 'resistance-list') resistanceLabel?.classList.remove('focused');
            }
        });
    }
});


// Toggle function for individual dropdowns
function dropdown(ul, label) {
    if (!ul || !label) return; // Safety check

    const currentlyOpen = ul.style.display === 'block';
    const buttonArrow = ul.parentElement?.nextElementSibling?.firstElementChild;

    // Close all other dropdowns first (optional, but good UX)
    document.querySelectorAll('.dropdown').forEach(otherUl => {
        if (otherUl !== ul && otherUl.style.display === 'block') {
            otherUl.style.display = 'none';
             const otherArrow = otherUl.parentElement?.nextElementSibling?.firstElementChild;
             if(otherArrow){
                otherArrow.classList.remove('up');
                otherArrow.classList.add('down');
             }
             // Remove focus from other labels
             if (otherUl.id.includes('attack-cost-list-1')) attack1label?.classList.remove('focused');
             else if (otherUl.id.includes('attack-cost-list-2')) attack2label?.classList.remove('focused');
             else if (otherUl.id === 'weakness-list') weaknessLabel?.classList.remove('focused');
             else if (otherUl.id === 'resistance-list') resistanceLabel?.classList.remove('focused');
        }
    });

    // Toggle the target dropdown
    ul.style.display = currentlyOpen ? 'none' : 'block';
    label.classList.toggle('focused', !currentlyOpen);
    if (buttonArrow) {
        buttonArrow.classList.toggle('up', !currentlyOpen);
        buttonArrow.classList.toggle('down', currentlyOpen);
    }
}

// Update function when an item in a dropdown is selected
function dropdownUpdate(typeImgContainer, ul, value) {
     if (!typeImgContainer || !ul) return; // Safety check

    if (value) {
        const img = document.createElement('img');
        img.setAttribute('src', 'img/' + value + '.png');
        img.setAttribute('alt', value + ' type');
        typeImgContainer.replaceChildren(img);
        // Add focus style to the container holding the image (e.g., the div with class 'type-img')
        typeImgContainer.parentElement?.classList.add('focus'); // Assumes img container's parent needs focus class
    } else {
        typeImgContainer.replaceChildren(''); // Clear image
        typeImgContainer.parentElement?.classList.remove('focus');
    }

    // Close the dropdown
    ul.style.display = 'none';
    const buttonArrow = ul.parentElement?.nextElementSibling?.firstElementChild;
     if(buttonArrow){
        buttonArrow.classList.remove('up');
        buttonArrow.classList.add('down');
     }

}

// ******** MAIN CARD TYPE SELECTION ********
const typeList = document.getElementById('type-list');
const typesArray = document.querySelectorAll('.select-type'); // In HTML, these should be elements within #type-list

let pastTypeElement = null; // Keep track of the selected type element

typesArray.forEach(typeElement => {
    typeElement.addEventListener('click', () => updateType(typeElement));
});

function updateType(selectedTypeElement) {
    // Remove highlight from previously selected type
    if (pastTypeElement) {
        pastTypeElement.classList.remove('highlight');
    }

    // Highlight the newly selected type
    selectedTypeElement.classList.add('highlight');
    pastTypeElement = selectedTypeElement; // Store the current element as the past one for next time

    // Update currentType variable
    const newType = selectedTypeElement.getAttribute('value');
    if (newType !== currentType) {
        // pastType = currentType; // updateContent handles pastType logic based on class removal
        currentType = newType;
        updateContent(); // Update the card display when type changes
    }
}
<!-- Add this after the existing type selector in index.html -->
<div id="dual-type-container">
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
</div>

<!-- Add this inside the img-drop-container div, after the existing img-drop-small -->
<div class="img-drop-mask hidden">
    Drop type mask here.
</div>
<div class="img-drop-second hidden">
    Drop secondary type image here.
</div>

// ******** ABILITY CREATION ********
function createAbility() {
    const name = $('input[name=ability-name]').val();
    const text = $('textarea[name=ability-text]').val();

    if (name) { // Only create if there's a name
        const div = document.createElement('div');
        div.classList.add('ability-container');

        const header = document.createElement('div');
        header.classList.add('ability-header');

        const img = document.createElement('img');
        img.src = 'img/ability.png'; // Path to ability icon
        img.alt = 'Ability';

        const title = document.createElement('p');
        title.innerHTML = name;

        header.appendChild(img);
        header.appendChild(title);
        div.appendChild(header);

        if (text) { // Only add text if provided
            const textEl = document.createElement('p');
             textEl.classList.add('ability-text'); // Add class for styling if needed
            textEl.innerHTML = text.replace(/\n/g, '<br>'); // Preserve line breaks
            div.appendChild(textEl);
        }
        return div;
    }
    return null; // Return null or undefined if no ability name
}


// ***************** ATTACKS FUNCTIONS *****************

// Store attack costs globally
let attackCosts = {
    attack1: ['', '', '', ''],
    attack2: ['', '', '', '']
};
const energyImgPath = 'img/energy/'; // Define path prefix

// --- Generic function to update attack cost ---
function updateAttackCost(attackNum, costIndex, value, listElement, imgElement, labelElement) {
    dropdownUpdate(imgElement, listElement, value); // Update the UI (image and close dropdown)
    attackCosts[`attack${attackNum}`][costIndex - 1] = value || ''; // Store the value (or empty string if null/clear)
    labelElement?.classList.remove('focused'); // Remove focus from the label
    updateContent(); // Update card display
}

// --- Setup listeners for Attack 1 costs ---
for (let i = 1; i <= 4; i++) {
    const list = document.getElementById(`attack-cost-list-1-${i}`);
    const img = document.getElementById(`current-cost-1-${i}`);
    const button = document.getElementById(`attack-1-cost-${i}-button`);
    if (list && img && button && attack1label) {
        button.addEventListener('click', () => dropdown(list, attack1label));
        list.querySelectorAll(`.cost-1-${i}`).forEach(type => {
            type.addEventListener('click', () => updateAttackCost(1, i, type.getAttribute("value"), list, img, attack1label));
        });
    }
}

// --- Setup listeners for Attack 2 costs ---
for (let i = 1; i <= 4; i++) {
    const list = document.getElementById(`attack-cost-list-2-${i}`);
    const img = document.getElementById(`current-cost-2-${i}`);
    const button = document.getElementById(`attack-2-cost-${i}-button`);
     if (list && img && button && attack2label) {
        button.addEventListener('click', () => dropdown(list, attack2label));
        list.querySelectorAll(`.cost-2-${i}`).forEach(type => {
            type.addEventListener('click', () => updateAttackCost(2, i, type.getAttribute("value"), list, img, attack2label));
        });
    }
}


// --- Generic function to create an attack element ---
function createAttack(attackNum) {
    const name = $(`input[name=attack${attackNum}-name]`).val();
    const damage = $(`input[name=attack-damage-${attackNum}]`).val();
    const text = $(`textarea[name=attack-text-${attackNum}]`).val();
    const costs = attackCosts[`attack${attackNum}`];

    // Only create the attack element if there's a name or at least one cost defined
    if (!name && costs.every(cost => !cost)) {
        return null; // Don't render empty attacks
    }

    const container = document.createElement('div');
    container.classList.add('attack');

    const attackDiv = document.createElement('div');
    attackDiv.classList.add('attack-main');

    // --- Attack Cost Images ---
    const attackCostContainer = document.createElement('div');
    attackCostContainer.classList.add('attack-cost');
    costs.forEach(costValue => {
        if (costValue) {
            const costImg = document.createElement('img');
            costImg.setAttribute('src', `${energyImgPath}${costValue}-energy.png`);
            costImg.setAttribute('alt', `${costValue} energy cost`);
            attackCostContainer.appendChild(costImg);
        }
    });
    attackDiv.appendChild(attackCostContainer);

    // --- Attack Name ---
    const attackNameEl = document.createElement('p');
    attackNameEl.classList.add('attack-name');
    attackNameEl.innerHTML = name || ''; // Use name or empty string
    attackDiv.appendChild(attackNameEl);

    // --- Attack Damage ---
    const attackDamageEl = document.createElement('p');
    attackDamageEl.classList.add('attack-damage');
    attackDamageEl.innerHTML = damage || ''; // Use damage or empty string
    attackDiv.appendChild(attackDamageEl);

    container.appendChild(attackDiv);

    // --- Attack Text ---
    if (text) {
        const attackTextEl = document.createElement('p');
        attackTextEl.classList.add('attack-text');
        attackTextEl.innerHTML = text.replace(/\n/g, '<br>'); // Preserve line breaks
        container.appendChild(attackTextEl);
    }

    return container;
}

// --- Specific functions calling the generic one ---
function createAttack1() {
    return createAttack(1);
}

function createAttack2() {
    return createAttack(2);
}


// ************ WEAKNESS & RESISTANCE DROPDOWN ************

// --- Weakness ---
const weaknessList = document.getElementById('weakness-list');
const weaknessImg = document.getElementById('current-weakness'); // The div containing the img
const weaknessButton = document.getElementById('weakness-button');

if (weaknessList && weaknessImg && weaknessButton && weaknessLabel) {
    weaknessButton.addEventListener('click', () => dropdown(weaknessList, weaknessLabel));

    document.querySelectorAll('.weakness-type').forEach(type => {
        type.addEventListener('click', () => {
            const value = type.getAttribute("value");
            dropdownUpdate(weaknessImg, weaknessList, value); // Update UI
            weakness = value || ''; // Update global variable
            weaknessLabel.classList.remove('focused');
            updateContent(); // Update card display
        });
    });
}


// --- Resistance ---
const resistanceList = document.getElementById('resistance-list');
const resistanceImg = document.getElementById('current-resistance'); // The div containing the img
const resistanceButton = document.getElementById('resistance-button');

if (resistanceList && resistanceImg && resistanceButton && resistanceLabel) {
    resistanceButton.addEventListener('click', () => dropdown(resistanceList, resistanceLabel));

    document.querySelectorAll('.resistance-type').forEach(type => {
        type.addEventListener('click', () => {
            const value = type.getAttribute("value");
            dropdownUpdate(resistanceImg, resistanceList, value); // Update UI
            resistance = value || ''; // Update global variable
            resistanceLabel.classList.remove('focused');
            updateContent(); // Update card display
        });
    });
}

// ************ FOCUS/HOVER STYLING FUNCTIONS ************

// Adds/Removes 'focused' class to the label based on input focus
function setupFocusListeners(inputName, labelSelector) {
    const inputElement = $(`input[name="${inputName}"], textarea[name="${inputName}"]`);
    const labelElement = $(labelSelector); // Use jQuery selector passed directly

    if (inputElement.length > 0 && labelElement.length > 0) {
        inputElement.on('focus', () => labelElement.addClass('focused'));
        inputElement.on('focusout', () => {
            // Keep focus if there's content, otherwise remove
             if (inputElement.val() === '') {
               labelElement.removeClass('focused');
             }
        });
         // Initial check in case of pre-filled values
         if (inputElement.val() !== '') {
             labelElement.addClass('focused');
         }
    } else {
        // console.warn(`Focus listener setup failed for input: ${inputName} or label: ${labelSelector}`);
    }
}

// Adds/Removes 'focused' class to the label based on select hover
function setupHoverListeners(selectName, labelSelector) {
    const selectElement = $(`select[name="${selectName}"]`);
    const labelElement = $(labelSelector);

    if (selectElement.length > 0 && labelElement.length > 0) {
        selectElement.hover(
            () => labelElement.addClass('focused'), // Mouse enter
            () => labelElement.removeClass('focused') // Mouse leave
        );
    } else {
       // console.warn(`Hover listener setup failed for select: ${selectName} or label: ${labelSelector}`);
    }
}

// Special focus for height inputs affecting both label and '.ht' element
function setupHeightFocusListeners(inputName) {
    const inputElement = $(`input[name="${inputName}"]`);
    const labelElement = $(`label[for="${inputName}"]`); // Assuming label 'for' matches input name
    const heightContainer = $('.ht'); // The shared container for height display/label

    if (inputElement.length > 0 && labelElement.length > 0 && heightContainer.length > 0) {
        inputElement.on('focus', () => {
            labelElement.addClass('focused');
            heightContainer.addClass('focused');
        });
        inputElement.on('focusout', () => {
            // Only remove focus if BOTH height inputs are empty
             const feetVal = $('input[name="feet"]').val();
             const inchesVal = $('input[name="inches"]').val();
             if (feetVal === '' && inchesVal === '') {
                labelElement.removeClass('focused');
                heightContainer.removeClass('focused');
             } else {
                 // If one still has value, keep the main container focused maybe?
                 // Or just remove focus from the specific label that lost focus
                 labelElement.removeClass('focused');
                 // Check if the *other* input still has focus to keep .ht focused
                 const otherInputName = inputName === 'feet' ? 'inches' : 'feet';
                 if (!$(`input[name="${otherInputName}"]`).is(':focus') && feetVal === '' && inchesVal === '') {
                    heightContainer.removeClass('focused');
                 }
             }
        });
         // Initial check
         if (inputElement.val() !== '') {
             labelElement.addClass('focused');
             heightContainer.addClass('focused');
         }
    } else {
        // console.warn(`Height focus listener setup failed for input: ${inputName}`);
    }
}

// Setup all focus/hover listeners
$(document).ready(function () {
    // Use label selectors directly for clarity
    setupFocusListeners('name', 'label[for="name"]');
    setupFocusListeners('hp', 'label[for="hp"]');
    setupHoverListeners('stage', 'label[for="stage"]');
    setupFocusListeners('evolves-from', 'label[for="evolves-from"]');
    setupFocusListeners('pokedex-number', 'label[for="pokedex-number"]');
    setupFocusListeners('category', 'label[for="category"]');
    setupHeightFocusListeners('feet'); // Handles label[for="feet"] and .ht
    setupHeightFocusListeners('inches'); // Handles label[for="inches"] and .ht
    setupFocusListeners('weight', 'label[for="weight"]');
    setupFocusListeners('ability-name', 'label[for="ability-name"]');
    setupFocusListeners('ability-text', 'label[for="ability-text"]'); // Textarea
    setupFocusListeners('attack1-name', 'label[for="attack1-name"]');
    setupFocusListeners('attack-damage-1', 'label[for="attack-damage-1"]');
    setupFocusListeners('attack-text-1', 'label[for="attack-text-1"]'); // Textarea
    setupFocusListeners('attack2-name', 'label[for="attack2-name"]');
    setupFocusListeners('attack-damage-2', 'label[for="attack-damage-2"]');
    setupFocusListeners('attack-text-2', 'label[for="attack-text-2"]'); // Textarea
    setupHoverListeners('retreat', 'label[for="retreat"]');

    // Add event listeners to call updateContent when form inputs change
    $('input, textarea, select').on('input change', updateContent);

    // Initial call to populate the card
    updateContent();
});