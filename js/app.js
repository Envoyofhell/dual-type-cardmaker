/**
 * File: js/app.js
 * Purpose: Main application file that initializes all components
 * Dependencies:
 *   - js/modules/ui/tabs.js
 *   - js/modules/layers/layer-manager.js
 *   - js/modules/effects/effects-manager.js
 *   - js/modules/ui/drag-drop.js
 *   - js/modules/persistence/state-manager.js
 *   - js/modules/export/download.js
 * Notes: 
 *   This is the main entry point that connects all components
 *   and initializes the application.
 */

// Import all modules
import './modules/ui/tabs.js';
import layerManager from './modules/layers/layer-manager.js';
import effectsManager from './modules/effects/effects-manager.js';
import dragDropManager from './modules/ui/drag-drop.js';
import { loadState, saveState, initAutoSave } from './modules/persistence/state-manager.js';
import cardDownloader from './modules/export/download.js';

/**
 * PokemonCardMaker - Main application class
 */
class PokemonCardMaker {
  /**
   * Initialize the application
   */
  constructor() {
    // Initialize state
    this.cardProperties = loadState('cardProperties', {});
    
    // UI elements
    this.resetButton = document.getElementById('reset-card');
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize the application
   */
  initialize() {
    console.log('Initializing Pokemon Card Maker Application');
    
    // Initialize auto-save
    initAutoSave();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Restore card state
    this.restoreCardState();
    
    // Initial card update
    this.updateContent();
    
    // Set up periodic state saving
    this.setupPeriodicSaving();
    
    console.log('Application initialized successfully');
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Reset button
    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the card? All unsaved changes will be lost.')) {
          this.resetCard();
        }
      });
    }
    
    // Listen for form input changes
    document.addEventListener('input', (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        // Schedule a content update
        this.scheduleContentUpdate();
      }
    });
    
    // Listen for state changes
    document.addEventListener('statechange', () => {
      // Schedule a content update
      this.scheduleContentUpdate();
    });
    
    // Window beforeunload - warn if unsaved changes
    window.addEventListener('beforeunload', (event) => {
      // Check if there are unsaved changes
      const lastSaved = this.cardProperties.lastSaved || 0;
      const lastModified = this.cardProperties.lastModified || 0;
      
      if (lastModified > lastSaved) {
        // There are unsaved changes
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        event.returnValue = message;
        return message;
      }
    });
  }
  
  /**
   * Set up periodic state saving
   */
  setupPeriodicSaving() {
    // Save state every 30 seconds
    setInterval(() => {
      this.saveCardState();
    }, 30000);
  }
  
  /**
   * Restore card state from localStorage
   */
  restoreCardState() {
    // Load card properties
    this.cardProperties = loadState('cardProperties', {});
    
    // Populate form fields
    this.populateFormFields();
    
    // Update the card
    this.updateContent();
  }
  
  /**
   * Populate form fields from saved state
   */
  populateFormFields() {
    // Load text content
    const textContent = loadState('textContent', {});
    
    // Populate input fields
    Object.entries(textContent).forEach(([key, value]) => {
      const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
      
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = value;
        } else {
          element.value = value;
        }
      }
    });
    
    // Load types
    const types = loadState('types', {});
    
    // Set primary type
    if (types.primary) {
      const primaryTypeElement = document.querySelector(`.select-type[value="${types.primary}"]`);
      if (primaryTypeElement) {
        // Trigger click on the type element
        primaryTypeElement.click();
      }
    }
    
    // Set secondary type
    if (types.secondary) {
      // Enable dual type
      const dualTypeToggle = document.getElementById('dual-type-toggle');
      if (dualTypeToggle) {
        dualTypeToggle.checked = true;
        
        // Trigger change event
        const event = new Event('change');
        dualTypeToggle.dispatchEvent(event);
      }
      
      // Select the secondary type
      const secondaryTypeElement = document.querySelector(`.select-second-type[value="${types.secondary}"]`);
      if (secondaryTypeElement) {
        // Trigger click on the type element
        secondaryTypeElement.click();
      }
    }
    
    // Apply holographic effect if enabled
    const holographicEffect = loadState('holographicEffect');
    if (holographicEffect) {
      const holoToggle = document.getElementById('holo-effect');
      if (holoToggle) {
        holoToggle.checked = holographicEffect;
        
        // Apply the effect
        const card = document.getElementById('card');
        if (card) {
          if (holographicEffect) {
            card.classList.add('holographic');
          } else {
            card.classList.remove('holographic');
          }
        }
      }
    }
  }
  
  /**
   * Schedule a content update (debounced)
   */
  scheduleContentUpdate() {
    // Clear any existing timeout
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    
    // Schedule an update
    this.updateTimeout = setTimeout(() => {
      this.updateContent();
    }, 100);
  }
  
  /**
   * Update card content based on form values
   */
  updateContent() {
    // Update card name
    const nameInput = document.querySelector('input[type=text][name=name]');
    if (nameInput) {
      const cardName = document.querySelector('.card-name');
      if (cardName) {
        cardName.innerHTML = nameInput.value;
      }
    }
    
    // Update HP
    const hpInput = document.querySelector('input[name=hp]');
    if (hpInput) {
      const hp = document.querySelector('.hp');
      const cardHp = document.querySelector('.card-hp');
      
      if (hp && cardHp) {
        if (hpInput.value !== '') {
          hp.innerHTML = hpInput.value;
          cardHp.innerHTML = 'HP';
        } else {
          hp.innerHTML = '';
          cardHp.innerHTML = '';
        }
      }
    }
    
    // Update pre-evolution
    const evolveFromInput = document.querySelector('input[name=evolves-from]');
    if (evolveFromInput) {
      const evolvesFromName = document.getElementById('evolves-from-name');
      
      if (evolvesFromName && evolveFromInput.value !== '') {
        evolvesFromName.innerHTML = 'Evolves from ' + evolveFromInput.value;
      } else if (evolvesFromName) {
        evolvesFromName.innerHTML = '';
      }
    }
    
    // Update Pokedex number
    const pokedexInput = document.querySelector('input[name=pokedex-number]');
    if (pokedexInput) {
      const pokedexNumber = document.querySelector('.pokedex-number');
      
      if (pokedexNumber && pokedexInput.value !== '') {
        pokedexNumber.innerHTML = 'NO. ' + pokedexInput.value;
      } else if (pokedexNumber) {
        pokedexNumber.innerHTML = '';
      }
    }
    
    // Update category
    const categoryInput = document.querySelector('input[name=category]');
    if (categoryInput) {
      const category = document.querySelector('.category');
      
      if (category && categoryInput.value !== '') {
        category.innerHTML = categoryInput.value + ' Pokemon';
      } else if (category) {
        category.innerHTML = '';
      }
    }
    
    // Update height
    const heightFeetInput = document.querySelector('input[name=feet]');
    const heightInchesInput = document.querySelector('input[name=inches]');
    if (heightFeetInput && heightInchesInput) {
      const height = document.querySelector('.height');
      
      if (height && (heightFeetInput.value !== '' || heightInchesInput.value !== '')) {
        height.innerHTML = `HT: ${heightFeetInput.value}'${heightInchesInput.value}"`;
      } else if (height) {
        height.innerHTML = '';
      }
    }
    
    // Update weight
    const weightInput = document.querySelector('input[name=weight]');
    if (weightInput) {
      const weight = document.querySelector('.weight');
      
      if (weight && weightInput.value !== '') {
        weight.innerHTML = `WT: ${weightInput.value} lbs.`;
      } else if (weight) {
        weight.innerHTML = '';
      }
    }
    
    // Update stage visibility
    const stageSelect = document.querySelector('select[name=stage]');
    if (stageSelect) {
      const smallImg = document.querySelector('.small-img');
      const evolvesFrom = document.querySelector('.evolves-from');
      
      if (smallImg && evolvesFrom) {
        if (stageSelect.value === 'basic') {
          smallImg.style.display = 'none';
          evolvesFrom.style.display = 'none';
        } else {
          smallImg.style.display = 'block';
          evolvesFrom.style.display = 'block';
        }
      }
    }
    
    // Update attacks
    this.updateAttacks();
    
    // Update weakness and resistance
    this.updateWeaknessResistance();
    
    // Update retreat cost
    this.updateRetreatCost();
    
    // Mark the card as modified
    this.cardProperties.lastModified = Date.now();
    saveState('cardProperties', this.cardProperties);
  }
  
  /**
   * Update attacks and ability
   */
  updateAttacks() {
    // Get attack container
    const attackContainer = document.querySelector('.attack-container');
    if (!attackContainer) return;
    
    // Clear existing attacks
    attackContainer.innerHTML = '';
    
    // Create ability if enabled
    const hasAbility = document.getElementById('has-ability');
    const abilityName = document.querySelector('input[name=ability-name]');
    const abilityText = document.querySelector('textarea[name=ability-text]');
    
    if (hasAbility && hasAbility.checked && abilityName && abilityName.value) {
      const ability = this.createAbility(abilityName.value, abilityText.value);
      attackContainer.appendChild(ability);
    }
    
    // Create attack 1
    const attack1Name = document.querySelector('input[name=attack1-name]');
    const attack1Damage = document.querySelector('input[name=attack-damage-1]');
    const attack1Text = document.querySelector('textarea[name=attack-text-1]');
    
    if (attack1Name && attack1Name.value) {
      const attack1 = this.createAttack(
        attack1Name.value,
        attack1Damage ? attack1Damage.value : '',
        attack1Text ? attack1Text.value : '',
        this.getAttackCost(1)
      );
      
      attackContainer.appendChild(attack1);
    }
    
    // Create attack 2 if enabled
    const hasAttack2 = document.getElementById('has-attack2');
    const attack2Name = document.querySelector('input[name=attack2-name]');
    const attack2Damage = document.querySelector('input[name=attack-damage-2]');
    const attack2Text = document.querySelector('textarea[name=attack-text-2]');
    
    if (hasAttack2 && hasAttack2.checked && attack2Name && attack2Name.value) {
      const attack2 = this.createAttack(
        attack2Name.value,
        attack2Damage ? attack2Damage.value : '',
        attack2Text ? attack2Text.value : '',
        this.getAttackCost(2)
      );
      
      attackContainer.appendChild(attack2);
    }
  }
  
  /**
   * Create an ability element
   * @param {string} name - The ability name
   * @param {string} text - The ability text
   * @returns {HTMLElement} The ability element
   */
  createAbility(name, text) {
    const container = document.createElement('div');
    container.classList.add('ability-container');
    
    const header = document.createElement('div');
    header.classList.add('ability-header');
    
    const img = document.createElement('img');
    img.src = 'img/ability.png';
    
    const title = document.createElement('p');
    title.innerHTML = name;
    
    const description = document.createElement('p');
    description.innerHTML = text;
    
    header.appendChild(img);
    header.appendChild(title);
    container.appendChild(header);
    container.appendChild(description);
    
    return container;
  }
  
  /**
   * Create an attack element
   * @param {string} name - The attack name
   * @param {string} damage - The attack damage
   * @param {string} text - The attack text
   * @param {Array} cost - The attack cost
   * @returns {HTMLElement} The attack element
   */
  createAttack(name, damage, text, cost) {
    const container = document.createElement('div');
    container.classList.add('attack');
    
    const attackMain = document.createElement('div');
    attackMain.classList.add('attack-main');
    
    const attackCost = document.createElement('div');
    attackCost.classList.add('attack-cost');
    
    // Add energy icons
    cost.forEach(energyType => {
      if (energyType) {
        const costImg = document.createElement('img');
        costImg.src = `img/energy/${energyType}-energy.png`;
        attackCost.appendChild(costImg);
      }
    });
    
    const attackName = document.createElement('p');
    attackName.classList.add('attack-name');
    attackName.innerHTML = name;
    
    const attackDamage = document.createElement('p');
    attackDamage.classList.add('attack-damage');
    attackDamage.innerHTML = damage;
    
    attackMain.appendChild(attackCost);
    attackMain.appendChild(attackName);
    attackMain.appendChild(attackDamage);
    container.appendChild(attackMain);
    
    if (text) {
      const attackText = document.createElement('p');
      attackText.classList.add('attack-text');
      attackText.innerHTML = text;
      container.appendChild(attackText);
    }
    
    return container;
  }
  
  /**
   * Get attack cost
   * @param {number} attackNumber - The attack number (1 or 2)
   * @returns {Array} The attack cost
   */
  getAttackCost(attackNumber) {
    const cost = [];
    
    for (let i = 1; i <= 4; i++) {
      const costElement = document.getElementById(`current-cost-${attackNumber}-${i}`);
      
      if (costElement && costElement.innerHTML) {
        // Get the energy type from the image
        const img = costElement.querySelector('img');
        
        if (img) {
          const src = img.getAttribute('src');
          const match = src.match(/img\/(.+)\.png/);
          
          if (match && match[1]) {
            cost.push(match[1]);
          } else {
            cost.push(null);
          }
        } else {
          cost.push(null);
        }
      } else {
        cost.push(null);
      }
    }
    
    return cost;
  }
  
  /**
   * Update weakness and resistance
   */
  updateWeaknessResistance() {
    // Get weakness from global variable
    const weakness = window.weakness;
    
    if (weakness) {
      const weaknessImg = document.getElementById('weakness-img');
      const weaknessNumber = document.querySelector('.weakness-number');
      
      if (weaknessImg && weaknessNumber) {
        weaknessImg.innerHTML = '';
        
        const img = document.createElement('img');
        img.src = `img/${weakness}.png`;
        weaknessImg.appendChild(img);
        
        weaknessNumber.innerHTML = '×2';
      }
    } else {
      const weaknessImg = document.getElementById('weakness-img');
      const weaknessNumber = document.querySelector('.weakness-number');
      
      if (weaknessImg && weaknessNumber) {
        weaknessImg.innerHTML = '';
        weaknessNumber.innerHTML = '';
      }
    }
    
    // Get resistance from global variable
    const resistance = window.resistance;
    
    if (resistance) {
      const resistanceImg = document.getElementById('resistance-img');
      const resistanceNumber = document.querySelector('.resistance-number');
      
      if (resistanceImg && resistanceNumber) {
        resistanceImg.innerHTML = '';
        
        const img = document.createElement('img');
        img.src = `img/${resistance}.png`;
        resistanceImg.appendChild(img);
        
        resistanceNumber.innerHTML = '-30';
      }
    } else {
      const resistanceImg = document.getElementById('resistance-img');
      const resistanceNumber = document.querySelector('.resistance-number');
      
      if (resistanceImg && resistanceNumber) {
        resistanceImg.innerHTML = '';
        resistanceNumber.innerHTML = '';
      }
    }
  }
  
  /**
   * Update retreat cost
   */
  updateRetreatCost() {
    const retreatSelect = document.querySelector('select[name=retreat]');
    const retreatImg = document.getElementById('retreat-img');
    
    if (retreatSelect && retreatImg) {
      retreatImg.innerHTML = '';
      
      const retreatValue = parseInt(retreatSelect.value, 10);
      
      for (let i = 0; i < retreatValue; i++) {
        const img = document.createElement('img');
        img.src = 'img/normal.png';
        retreatImg.appendChild(img);
      }
    }
  }
  
  /**
   * Save card state
   */
  saveCardState() {
    const lastModified = this.cardProperties.lastModified || 0;
    const lastSaved = this.cardProperties.lastSaved || 0;
    
    // Only save if there are changes
    if (lastModified > lastSaved) {
      // Update last saved timestamp
      this.cardProperties.lastSaved = Date.now();
      saveState('cardProperties', this.cardProperties);
      
      console.log('Card state saved');
    }
  }
  
  /**
   * Reset the card to default state
   */
  resetCard() {
    // Clear form fields
    document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(input => {
      input.value = '';
    });
    
    // Reset select elements
    document.getElementById('stage').value = 'basic';
    document.getElementById('retreat').value = '0';
    
    // Reset type selections
    document.querySelectorAll('.select-type, .select-second-type').forEach(typeEl => {
      typeEl.classList.remove('highlight');
    });
    
    // Reset dual type
    const dualTypeToggle = document.getElementById('dual-type-toggle');
    if (dualTypeToggle) {
      dualTypeToggle.checked = false;
      
      const secondTypeSelector = document.getElementById('second-type-selector');
      if (secondTypeSelector) {
        secondTypeSelector.classList.add('hidden');
      }
      
      // Remove second layer
      const secondLayer = document.getElementById('second-card-layer');
      if (secondLayer) {
        secondLayer.remove();
      }
    }
    
    // Reset weakness and resistance
    window.weakness = '';
    window.resistance = '';
    
    // Reset attack costs
    document.querySelectorAll('.current-type').forEach(costType => {
      costType.innerHTML = '';
    });
    
    // Reset holographic effect
    const holoToggle = document.getElementById('holo-effect');
    if (holoToggle) {
      holoToggle.checked = false;
      
      const card = document.getElementById('card');
      if (card) {
        card.classList.remove('holographic');
      }
    }
    
    // Reset images
    document.querySelector('.card-img').innerHTML = '';
    document.querySelector('.small-img').innerHTML = '';
    document.querySelector('.img-drop').textContent = 'Drop Pokémon image here.';
    document.querySelector('.img-drop-small').textContent = 'Drop pre-evolution image here.';
    
    // Reset custom backgrounds and types
    const customBgLayer = document.getElementById('custom-bg-layer');
    if (customBgLayer) {
      customBgLayer.remove();
    }
    
    // Reset card background
    const card = document.getElementById('card');
    if (card) {
      card.style.backgroundImage = '';
      card.className = '';
    }
    
    // Reset layers in layer manager
    layerManager.resetLayers();
    
    // Clear state
    this.cardProperties = {};
    saveState('cardProperties', this.cardProperties);
    
    // Reset effects
    saveState('holographicEffect', false);
    saveState('currentMask', '');
    saveState('currentBlendMode', 'normal');
    saveState('customMask', null);
    saveState('customBackground', null);
    saveState('customTypes', null);
    saveState('types', null);
    
    // Update the card
    this.updateContent();
    
    console.log('Card reset to default state');
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new PokemonCardMaker();
});

// Export the PokemonCardMaker class
export default PokemonCardMaker;