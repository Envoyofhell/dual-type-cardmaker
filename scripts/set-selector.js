// scripts/set-selector.js

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', initSetSelector);

// Initialize global variables
window.currentSet = 'Classic';
window.dualTypeSet = 'Classic';

// Add to the end of your initSetSelector function in set-selector.js

function initSetSelector() {
  // Create the set selector UI
  createSetSelector();
  
  // Define card update functions
  defineCardUpdateFunctions();
  
  // Force initial update with selected set
  setTimeout(function() {
    // Make sure currentSet is set
    const setSelect = document.getElementById('card-set');
    if (setSelect && setSelect.value) {
      window.currentSet = setSelect.value;
    }
    
    // Update main card with current set
    if (typeof window.updateCardFromSet === 'function') {
      window.updateCardFromSet();
    }
    
    // Update dual layer if dual type is enabled
    if (window.isDualType && window.secondType && 
        typeof window.updateDualLayerFromSet === 'function') {
      window.updateDualLayerFromSet();
    }
  }, 100); // Small delay to ensure DOM is ready
}

function createSetSelector() {
  const stageInput = document.querySelector('.stage-input');
  if (!stageInput) return;
  
  // Create container
  const setInput = document.createElement('div');
  setInput.className = 'stage-input';
  setInput.innerHTML = `
    <div id="set-dropdown" class="input-header closed">
      <h2>Card Set:</h2>
      <div class="arrowbox">
        <i id="set-arrow" class="arrow down"></i>
      </div>
    </div>
    <div id="set-body" class="input-body">
      <div style="padding-left: 20px;">
        <label for="card-set">Set:</label>
        <select id="card-set" name="card-set"></select>
      </div>
    </div>
  `;
  
  // Insert into DOM
  stageInput.parentNode.insertBefore(setInput, stageInput);
  
  // Add dual type selector
  addDualSetSelector();
  
  // Populate selectors with sets from SETS_CONFIG
  populateSetSelectors();
  
  // Set up event handlers
  setupEventHandlers();
}

function populateSetSelectors() {
  const setSelect = document.getElementById('card-set');
  const dualSetSelect = document.getElementById('dual-card-set');
  
  if (!window.SETS_CONFIG) {
    console.error("SETS_CONFIG not found! Make sure sets.js is loaded before set-selector.js");
    return;
  }
  
  // Sort sets by order
  const sortedSets = Object.entries(window.SETS_CONFIG)
    .sort((a, b) => a[1].order - b[1].order);
  
  // Add options to main selector
  if (setSelect) {
    sortedSets.forEach(([key, config]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = config.name;
      setSelect.appendChild(option);
    });
  }
  
  // Add options to dual selector
  if (dualSetSelect) {
    sortedSets.forEach(([key, config]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = config.name;
      dualSetSelect.appendChild(option);
    });
  }
}

function addDualSetSelector() {
  const secondTypeSelector = document.getElementById('second-type-selector');
  if (!secondTypeSelector) return;
  
  // Create dual set selector
  const dualSetSelector = document.createElement('div');
  dualSetSelector.id = 'dual-set-selector';
  dualSetSelector.className = 'hidden';
  dualSetSelector.innerHTML = `
    <p style="margin-top:10px;">Second Type Set:</p>
    <select id="dual-card-set" name="dual-card-set"></select>
  `;
  
  secondTypeSelector.appendChild(dualSetSelector);
}

function setupEventHandlers() {
  // Set dropdown toggle
  const setDropdown = document.getElementById('set-dropdown');
  const setBody = document.getElementById('set-body');
  const setArrow = document.getElementById('set-arrow');
  
  setDropdown.onclick = function() {
    if (this.classList.contains('closed')) {
      setBody.style.height = '50px';
      setBody.classList.add('border-bottom');
      this.classList.remove('closed');
      this.classList.add('opened');
      setArrow.classList.remove('down');
      setArrow.classList.add('up');
    } else {
      setBody.style.height = '0';
      setBody.classList.remove('border-bottom');
      this.classList.remove('opened');
      this.classList.add('closed');
      setArrow.classList.remove('up');
      setArrow.classList.add('down');
    }
  };
  
  // Set selection change
  const setSelect = document.getElementById('card-set');
  if (setSelect) {
    setSelect.addEventListener('change', function() {
      window.currentSet = this.value;
      updateCardFromSet();
    });
  }
  
  // Dual set selection change
  const dualSetSelect = document.getElementById('dual-card-set');
  if (dualSetSelect) {
    dualSetSelect.addEventListener('change', function() {
      window.dualTypeSet = this.value;
      updateDualLayerFromSet();
    });
  }
  
  // Dual type toggle
  const dualTypeToggle = document.getElementById('dual-type-toggle');
  if (dualTypeToggle) {
    dualTypeToggle.addEventListener('change', function() {
      const dualSetSelector = document.getElementById('dual-set-selector');
      if (dualSetSelector) {
        if (this.checked) {
          dualSetSelector.classList.remove('hidden');
        } else {
          dualSetSelector.classList.add('hidden');
        }
      }
    });
  }
}

function defineCardUpdateFunctions() {
  // Function to generate image path based on set configuration
  window.getCardImagePath = function(setKey, type, stage) {
    if (!window.SETS_CONFIG || !window.SETS_CONFIG[setKey]) {
      return null;
    }
    
    const setConfig = window.SETS_CONFIG[setKey];
    
    // If CSS-based, return null
    if (setConfig.cssClassBased) {
      return null;
    }
    
    const typeFormatted = type.charAt(0).toUpperCase() + type.slice(1);
    const stageCode = setConfig.stageFormat[stage] || stage;
    const prefix = setConfig.prefix;
    
    // Use the set's filename format with replacements
    let path = setConfig.filenameFormat
      .replace('{prefix}', prefix)
      .replace('{type}', typeFormatted)
      .replace('{stage}', stageCode);
    
    // For formats that use stageClass
    if (path.includes('{stageClass}')) {
      const stageClass = stageCode;
      path = path.replace('{stageClass}', stageClass);
    }
    
    // Build the full path
    const fullPath = `${setConfig.path}/${typeFormatted}/${path}.png`;
    
    return fullPath;
  };
  
  // Try multiple filename patterns for flexibility
  window.tryMultiplePathFormats = function(setKey, type, stage) {
    // First try the standard path from the configuration
    const standardPath = window.getCardImagePath(setKey, type, stage);
    
    // Create array of possible path variations
    const paths = [
      standardPath,
      // P - Type - S0.png format
      `img/${setKey}/${type.charAt(0).toUpperCase() + type.slice(1)}/P - ${type.charAt(0).toUpperCase() + type.slice(1)} - S${stage === 'basic' ? '0' : stage === 'stage-1' ? '1' : '2'}.png`,
      // P- Type - S0.png format
      `img/${setKey}/${type.charAt(0).toUpperCase() + type.slice(1)}/P- ${type.charAt(0).toUpperCase() + type.slice(1)} - S${stage === 'basic' ? '0' : stage === 'stage-1' ? '1' : '2'}.png`
    ];
    
    console.log("Trying paths:", paths);
    return paths;
  };
  
  // Function to update main card background
  window.updateCardFromSet = function() {
    const card = document.getElementById('card');
    if (!card) return;
    
    const currentType = window.currentType || 'water';
    const stageSelect = document.getElementById('stage');
    const currentStage = stageSelect ? stageSelect.value : 'basic';
    
    // Remove existing class
    if (window.pastStage !== '') {
      card.classList.remove('card-' + window.pastType + '-' + window.pastStage);
    }
    
    const setConfig = window.SETS_CONFIG[window.currentSet];
    
    if (setConfig && !setConfig.cssClassBased) {
      // Use image-based background
      const paths = window.tryMultiplePathFormats(window.currentSet, currentType, currentStage);
      
      // Use multiple background images with fallbacks
      card.style.backgroundImage = paths.map(p => `url('${p}')`).join(', ');
      card.className = ''; // Remove class-based styling
    } else {
      // Default Classic set using CSS classes
      card.style.backgroundImage = '';
      card.classList.add('card-' + currentType + '-' + currentStage);
    }
    
    window.pastType = currentType;
    window.pastStage = currentStage;
  };
  
  // Function to update dual layer
  window.updateDualLayerFromSet = function() {
    if (window.dualTypeSimple && typeof window.dualTypeSimple.updateSecondLayer === 'function') {
      window.dualTypeSimple.updateSecondLayer();
    }
  };
}