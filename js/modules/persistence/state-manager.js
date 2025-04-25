/**
 * File: js/modules/persistence/state-manager.js
 * Purpose: Manages state persistence for the card editor
 * Dependencies: None
 * Notes: Handles saving/loading state to localStorage and serializing card data
 */

// State storage key prefix
/**
 * Simple debounce function
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} The debounced function
 */
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
          func.apply(this, args);
      }, delay);
  };
}
const STATE_KEY_PREFIX = 'pokemon_card_maker_';

/**
 * Save state to localStorage
 * @param {string} key - The state key
 * @param {any} value - The state value
 */
export function saveState(key, value) {
  try {
    const stateKey = `${STATE_KEY_PREFIX}${key}`;
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(stateKey, serializedValue);
    
    // Dispatch a state change event
    const stateChangeEvent = new CustomEvent('statechange', {
      detail: { key, value }
    });
    document.dispatchEvent(stateChangeEvent);
    
    return true;
  } catch (error) {
    console.error(`Error saving state for key ${key}:`, error);
    return false;
  }
}

/**
 * Load state from localStorage
 * @param {string} key - The state key
 * @param {any} defaultValue - Default value if the state doesn't exist
 * @returns {any} The state value
 */
export function loadState(key, defaultValue = null) {
  try {
    const stateKey = `${STATE_KEY_PREFIX}${key}`;
    const serializedValue = localStorage.getItem(stateKey);
    
    if (serializedValue === null) {
      return defaultValue;
    }
    
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error(`Error loading state for key ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Delete state from localStorage
 * @param {string} key - The state key
 */
export function deleteState(key) {
  try {
    const stateKey = `${STATE_KEY_PREFIX}${key}`;
    localStorage.removeItem(stateKey);
    return true;
  } catch (error) {
    console.error(`Error deleting state for key ${key}:`, error);
    return false;
  }
}

/**
 * Clear all state from localStorage
 */
export function clearState() {
  try {
    // Get all keys with the prefix
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(STATE_KEY_PREFIX)) {
        keys.push(key);
      }
    }
    
    // Remove all matching keys
    keys.forEach(key => localStorage.removeItem(key));
    
    return true;
  } catch (error) {
    console.error('Error clearing state:', error);
    return false;
  }
}

/**
 * Serialize the card's entire state into a single object
 * @returns {Object} The serialized card state
 */
export function serializeCardState() {
  // Gather all states
  const serializedState = {
    version: '1.0.0',
    timestamp: Date.now(),
    cardProperties: loadState('cardProperties', {}),
    layers: loadState('layers', []),
    effects: loadState('effects', {}),
    textContent: loadState('textContent', {}),
    gameStats: loadState('gameStats', {}),
    types: loadState('types', {}),
    sets: loadState('sets', {})
  };
  
  return serializedState;
}

/**
 * Deserialize card state from a serialized object
 * @param {Object} serializedState - The serialized state object
 * @returns {boolean} Success flag
 */
export function deserializeCardState(serializedState) {
  try {
    // Validate the serialized state
    if (!serializedState || typeof serializedState !== 'object') {
      throw new Error('Invalid serialized state');
    }
    
    // Check version compatibility (basic check)
    const version = serializedState.version || '1.0.0';
    const versionParts = version.split('.').map(Number);
    
    // Currently we only support version 1.x.x
    if (versionParts[0] !== 1) {
      throw new Error(`Unsupported state version: ${version}`);
    }
    
    // Save each state section
    if (serializedState.cardProperties) {
      saveState('cardProperties', serializedState.cardProperties);
    }
    
    if (serializedState.layers) {
      saveState('layers', serializedState.layers);
    }
    
    if (serializedState.effects) {
      saveState('effects', serializedState.effects);
    }
    
    if (serializedState.textContent) {
      saveState('textContent', serializedState.textContent);
    }
    
    if (serializedState.gameStats) {
      saveState('gameStats', serializedState.gameStats);
    }
    
    if (serializedState.types) {
      saveState('types', serializedState.types);
    }
    
    if (serializedState.sets) {
      saveState('sets', serializedState.sets);
    }
    
    return true;
  } catch (error) {
    console.error('Error deserializing state:', error);
    return false;
  }
}

/**
 * Export card state to a file
 * @returns {boolean} Success flag
 */
export function exportCardState() {
  try {
    const serializedState = serializeCardState();
    const dataStr = JSON.stringify(serializedState, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = getCardName() || 'pokemon-card';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `${exportFileName}.json`);
    linkElement.style.display = 'none';
    
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    
    return true;
  } catch (error) {
    console.error('Error exporting card state:', error);
    return false;
  }
}

/**
 * Import card state from a file
 * @param {File} file - The JSON file containing card state
 * @returns {Promise<boolean>} Promise resolving to success flag
 */
export function importCardState(file) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const serializedState = JSON.parse(event.target.result);
          const success = deserializeCardState(serializedState);
          
          if (success) {
            // Dispatch an event to notify components that state has been imported
            const importEvent = new CustomEvent('stateimport', {
              detail: { success: true }
            });
            document.dispatchEvent(importEvent);
            
            resolve(true);
          } else {
            reject(new Error('Failed to deserialize card state'));
          }
        } catch (parseError) {
          console.error('Error parsing imported file:', parseError);
          reject(parseError);
        }
      };
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        reject(error);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing card state:', error);
      reject(error);
    }
  });
}

/**
 * Get the name of the current card
 * @returns {string} The card name
 */
function getCardName() {
  const cardProperties = loadState('cardProperties', {});
  return cardProperties.name || '';
}

/**
 * Auto-save functionality that saves changes after each update
 * @param {string} key - The state key
 * @param {any} value - The state value
 */
export function autoSave(key, value) {
  // Save the specific state
  saveState(key, value);
  
  // Also update the timestamp in card properties
  const cardProperties = loadState('cardProperties', {});
  cardProperties.lastModified = Date.now();
  saveState('cardProperties', cardProperties);
}

/**
 * Set up listeners for auto-save
 */
export function initAutoSave() {
  // Listen for form input changes
  document.addEventListener('input', (event) => {
    const target = event.target;
    
    // Skip if the element doesn't have an ID or name
    if (!target.id && !target.name) return;
    
    // Get the relevant state key and value based on the input
    const key = 'textContent';
    const textContent = loadState(key, {});
    
    // Use id or name as the property key
    const propKey = target.id || target.name;
    
    // Update the value based on input type
    if (target.type === 'checkbox') {
      textContent[propKey] = target.checked;
    } else {
      textContent[propKey] = target.value;
    }
    
    // Auto-save
    autoSave(key, textContent);
  });
  
  // Inside initAutoSave() function in state-manager.js (around lines 314-319)

// Located inside initAutoSave() function in state-manager.js

document.addEventListener('statechange', (event) => {
  // This listener ensures the 'lastModified' timestamp in 'cardProperties'
  // is updated whenever any state is successfully saved via saveState.

  // Optional: Log which key triggered this timestamp update
  const triggeringKey = event.detail?.key || 'unknown';
  console.log(`'statechange' listener updating timestamp due to change in key: '${triggeringKey}'`);

  try {
      const cardPropertiesKey = `${STATE_KEY_PREFIX}cardProperties`;
      let cardProperties = {}; // Default to empty object

      // Load existing properties, handling potential parsing errors
      const currentCardPropsString = localStorage.getItem(cardPropertiesKey);
      if (currentCardPropsString) {
          try {
              cardProperties = JSON.parse(currentCardPropsString);
              // Ensure it's an object
              if (typeof cardProperties !== 'object' || cardProperties === null) {
                   console.warn('Parsed cardProperties was not an object, resetting.');
                   cardProperties = {};
              }
          } catch (parseError) {
              console.error('Error parsing existing cardProperties for timestamp update:', parseError);
              // Proceed with an empty object if parsing fails
              cardProperties = {};
          }
      }

      // Update the timestamp
      cardProperties.lastModified = Date.now();

      // Save back directly using setItem to avoid dispatching another event
      localStorage.setItem(cardPropertiesKey, JSON.stringify(cardProperties));
      // console.log('Updated cardProperties timestamp directly via statechange listener.'); // Log can be noisy, maybe remove

  } catch (error) {
      console.error('Error updating timestamp in statechange listener:', error);
  }
});
}

// Initialize auto-save when the document is loaded
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', initAutoSave);
}