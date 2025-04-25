/**
 * File: js/modules/attacks/attack-manager.js
 * Purpose: Manages attacks and abilities with improved interactions
 * Dependencies: 
 *   - js/modules/persistence/state-manager.js
 * Notes: Provides a more interactive interface for managing attacks and abilities
 */

import { saveState, loadState } from '../persistence/state-manager.js';

/**
 * AttackManager - Handles creation, modification, and rendering of attacks and abilities
 */
class AttackManager {
  /**
   * Initialize the attack manager
   */
  constructor() {
    // DOM elements
    this.attackContainer = document.querySelector('.attack-container');
    this.addAttackButton = document.getElementById('add-attack-btn');
    this.addAbilityButton = document.getElementById('add-ability-btn');
    
    // Attack storage
    this.attacks = [];
    this.activeAttackId = null;
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize the attack manager
   */
  initialize() {
    // Create default attack if none exist
    this.loadAttacks();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initial render
    this.renderAttacks();
  }
  
  /**
   * Load attacks from state
   */
  loadAttacks() {
    const savedAttacks = loadState('attacks');
    
    if (savedAttacks && savedAttacks.length > 0) {
      this.attacks = savedAttacks;
    } else {
      // Create a default attack
      this.addDefaultAttack();
    }
  }
  
  /**
   * Add a default attack
   */
  addDefaultAttack() {
    const defaultAttack = {
      id: `attack_${Date.now()}`,
      name: 'Attack',
      type: 'attack', // 'attack' or 'ability'
      energyCost: [],
      damage: '',
      description: '',
      order: 0 // Order for display
    };
    
    this.attacks.push(defaultAttack);
    this.saveAttacks();
  }
  
  /**
   * Save attacks to state
   */
  saveAttacks() {
    saveState('attacks', this.attacks);
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Add attack button
    if (this.addAttackButton) {
      this.addAttackButton.addEventListener('click', () => {
        this.addAttack();
      });
    }
    
    // Add ability button
    if (this.addAbilityButton) {
      this.addAbilityButton.addEventListener('click', () => {
        this.addAbility();
      });
    }
    
    // Listen for energy type clicks
    document.addEventListener('click', (e) => {
      // Check if the clicked element is an energy type button
      if (e.target.closest('.energy-type-btn')) {
        const button = e.target.closest('.energy-type-btn');
        const attackId = button.getAttribute('data-attack-id');
        const energyType = button.getAttribute('data-energy-type');
        
        if (attackId && energyType) {
          this.addEnergyCost(attackId, energyType);
        }
      }
      
      // Check if the clicked element is an energy cost item
      if (e.target.closest('.energy-cost-item')) {
        const item = e.target.closest('.energy-cost-item');
        const attackId = item.getAttribute('data-attack-id');
        const energyIndex = parseInt(item.getAttribute('data-energy-index'), 10);
        
        if (attackId && !isNaN(energyIndex)) {
          this.removeEnergyCost(attackId, energyIndex);
        }
      }
    });
  }
  
  /**
   * Add a new attack
   */
  addAttack() {
    const newIndex = this.attacks.length;
    const newAttack = {
      id: `attack_${Date.now()}`,
      name: `Attack ${newIndex + 1}`,
      type: 'attack',
      energyCost: [],
      damage: '',
      description: '',
      order: newIndex
    };
    
    this.attacks.push(newAttack);
    this.saveAttacks();
    this.renderAttacks();
  }
  
  /**
   * Add a new ability
   */
  addAbility() {
    const newIndex = this.attacks.length;
    const newAbility = {
      id: `ability_${Date.now()}`,
      name: `Ability ${newIndex + 1}`,
      type: 'ability',
      energyCost: [],
      damage: '',
      description: '',
      order: newIndex
    };
    
    this.attacks.push(newAbility);
    this.saveAttacks();
    this.renderAttacks();
  }
  
  /**
   * Remove an attack or ability
   * @param {string} id - The ID of the attack/ability to remove
   */
  removeAttack(id) {
    const index = this.attacks.findIndex(attack => attack.id === id);
    if (index === -1) return;
    
    // Remove the attack
    this.attacks.splice(index, 1);
    
    // Update order for remaining attacks
    this.attacks.forEach((attack, idx) => {
      attack.order = idx;
    });
    
    this.saveAttacks();
    this.renderAttacks();
  }
  
  /**
   * Add energy cost to an attack
   * @param {string} attackId - The ID of the attack
   * @param {string} energyType - The type of energy to add
   */
  addEnergyCost(attackId, energyType) {
    const attack = this.attacks.find(a => a.id === attackId);
    if (!attack) return;
    
    // Add the energy to the cost
    attack.energyCost.push(energyType);
    
    this.saveAttacks();
    this.renderAttackById(attackId);
    this.updateContent();
  }
  
  /**
   * Remove energy cost from an attack
   * @param {string} attackId - The ID of the attack
   * @param {number} index - The index of the energy to remove
   */
  removeEnergyCost(attackId, index) {
    const attack = this.attacks.find(a => a.id === attackId);
    if (!attack || index >= attack.energyCost.length) return;
    
    // Remove the energy at the specified index
    attack.energyCost.splice(index, 1);
    
    this.saveAttacks();
    this.renderAttackById(attackId);
    this.updateContent();
  }
  
  /**
   * Change attack type (attack/ability)
   * @param {string} attackId - The ID of the attack
   * @param {string} newType - The new type ('attack' or 'ability')
   */
  changeAttackType(attackId, newType) {
    const attack = this.attacks.find(a => a.id === attackId);
    if (!attack) return;
    
    // Update the type
    attack.type = newType;
    
    // Clear energy cost if changing to ability
    if (newType === 'ability') {
      attack.energyCost = [];
      attack.damage = '';
    }
    
    this.saveAttacks();
    this.renderAttacks(); // Re-render all to update the UI properly
  }
  
  /**
   * Move an attack up in order
   * @param {string} attackId - The ID of the attack
   */
  moveAttackUp(attackId) {
    const attackIndex = this.attacks.findIndex(a => a.id === attackId);
    if (attackIndex <= 0) return; // Already at the top
    
    // Swap with the attack above
    const temp = this.attacks[attackIndex - 1].order;
    this.attacks[attackIndex - 1].order = this.attacks[attackIndex].order;
    this.attacks[attackIndex].order = temp;
    
    // Sort by order
    this.attacks.sort((a, b) => a.order - b.order);
    
    this.saveAttacks();
    this.renderAttacks();
  }
  
  /**
   * Move an attack down in order
   * @param {string} attackId - The ID of the attack
   */
  moveAttackDown(attackId) {
    const attackIndex = this.attacks.findIndex(a => a.id === attackId);
    if (attackIndex === -1 || attackIndex >= this.attacks.length - 1) return; // Already at the bottom
    
    // Swap with the attack below
    const temp = this.attacks[attackIndex + 1].order;
    this.attacks[attackIndex + 1].order = this.attacks[attackIndex].order;
    this.attacks[attackIndex].order = temp;
    
    // Sort by order
    this.attacks.sort((a, b) => a.order - b.order);
    
    this.saveAttacks();
    this.renderAttacks();
  }
  
  /**
   * Update attack property
   * @param {string} attackId - The ID of the attack
   * @param {string} property - The property to update
   * @param {any} value - The new value
   */
  updateAttackProperty(attackId, property, value) {
    const attack = this.attacks.find(a => a.id === attackId);
    if (!attack) return;
    
    // Update the property
    attack[property] = value;
    
    this.saveAttacks();
    this.updateContent();
  }
  
  /**
   * Render all attacks to the container
   */
  renderAttacks() {
    if (!this.attackContainer) return;
    
    // Clear the container
    this.attackContainer.innerHTML = '';
    
    // Sort attacks by order
    const sortedAttacks = [...this.attacks].sort((a, b) => a.order - b.order);
    
    // Render each attack
    sortedAttacks.forEach(attack => {
      this.renderAttack(attack);
    });
    
    // Update the card content
    this.updateContent();
  }
  
  /**
   * Render a specific attack by ID
   * @param {string} attackId - The ID of the attack to render
   */
  renderAttackById(attackId) {
    const attack = this.attacks.find(a => a.id === attackId);
    if (!attack) return;
    
    // Find existing attack element
    const existingElement = document.getElementById(`attack-${attackId}`);
    if (existingElement) {
      // Replace with new element
      this.renderAttack(attack, existingElement);
    } else {
      // Render as new
      this.renderAttack(attack);
    }
  }
  
  /**
   * Render an attack to the container
   * @param {Object} attack - The attack to render
   * @param {HTMLElement} existingElement - Optional existing element to replace
   */
  renderAttack(attack, existingElement = null) {
    // Create attack form element
    const attackElement = document.createElement('div');
    attackElement.className = 'attack-form';
    attackElement.id = `attack-${attack.id}`;
    attackElement.dataset.attackId = attack.id;
    
    // Create header with controls
    const header = document.createElement('div');
    header.className = 'attack-header';
    
    // Type toggle
    const typeToggle = document.createElement('select');
    typeToggle.className = 'attack-type-toggle';
    
    const attackOption = document.createElement('option');
    attackOption.value = 'attack';
    attackOption.textContent = 'Attack';
    attackOption.selected = attack.type === 'attack';
    
    const abilityOption = document.createElement('option');
    abilityOption.value = 'ability';
    abilityOption.textContent = 'Ability';
    abilityOption.selected = attack.type === 'ability';
    
    typeToggle.appendChild(attackOption);
    typeToggle.appendChild(abilityOption);
    
    typeToggle.addEventListener('change', () => {
      this.changeAttackType(attack.id, typeToggle.value);
    });
    
    // Attack title
    const title = document.createElement('div');
    title.className = 'attack-title';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'attack-name-input';
    nameInput.value = attack.name;
    nameInput.placeholder = attack.type === 'attack' ? 'Attack Name' : 'Ability Name';
    
    nameInput.addEventListener('input', () => {
      this.updateAttackProperty(attack.id, 'name', nameInput.value);
    });
    
    title.appendChild(nameInput);
    
    // Controls (move up, move down, delete)
    const controls = document.createElement('div');
    controls.className = 'attack-controls';
    
    const moveUpBtn = document.createElement('button');
    moveUpBtn.type = 'button';
    moveUpBtn.className = 'attack-move-up';
    moveUpBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z" fill="currentColor"/></svg>';
    moveUpBtn.title = 'Move Up';
    
    moveUpBtn.addEventListener('click', () => {
      this.moveAttackUp(attack.id);
    });
    
    const moveDownBtn = document.createElement('button');
    moveDownBtn.type = 'button';
    moveDownBtn.className = 'attack-move-down';
    moveDownBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" fill="currentColor"/></svg>';
    moveDownBtn.title = 'Move Down';
    
    moveDownBtn.addEventListener('click', () => {
      this.moveAttackDown(attack.id);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'attack-delete';
    deleteBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/></svg>';
    deleteBtn.title = 'Delete';
    
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete this ${attack.type}?`)) {
        this.removeAttack(attack.id);
      }
    });
    
    controls.appendChild(moveUpBtn);
    controls.appendChild(moveDownBtn);
    controls.appendChild(deleteBtn);
    
    header.appendChild(typeToggle);
    header.appendChild(title);
    header.appendChild(controls);
    
    // Attack body
    const body = document.createElement('div');
    body.className = 'attack-body';
    
    // Only show energy cost and damage for attacks, not abilities
    if (attack.type === 'attack') {
      // Energy cost
      const energyCostSection = document.createElement('div');
      energyCostSection.className = 'energy-cost-section';
      
      const energyLabel = document.createElement('label');
      energyLabel.textContent = 'Energy Cost:';
      
      const energyCostDisplay = document.createElement('div');
      energyCostDisplay.className = 'energy-cost-display';
      
      // Display current energy cost
      attack.energyCost.forEach((energy, index) => {
        const energyItem = document.createElement('div');
        energyItem.className = 'energy-cost-item';
        energyItem.dataset.attackId = attack.id;
        energyItem.dataset.energyIndex = index;
        
        const energyImg = document.createElement('img');
        energyImg.src = `img/energy/${energy}-energy.png`;
        energyImg.alt = energy;
        
        energyItem.appendChild(energyImg);
        energyCostDisplay.appendChild(energyItem);
      });
      
      // Energy type buttons
      const energyTypes = ['grass', 'fire', 'water', 'electric', 'psychic', 'fighting', 'dark', 'metal', 'normal'];
      const energyButtonsContainer = document.createElement('div');
      energyButtonsContainer.className = 'energy-buttons';
      
      energyTypes.forEach(type => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'energy-type-btn';
        button.dataset.attackId = attack.id;
        button.dataset.energyType = type;
        
        const img = document.createElement('img');
        img.src = `img/${type}.png`;
        img.alt = type;
        
        button.appendChild(img);
        energyButtonsContainer.appendChild(button);
      });
      
      energyCostSection.appendChild(energyLabel);
      energyCostSection.appendChild(energyCostDisplay);
      energyCostSection.appendChild(energyButtonsContainer);
      
      body.appendChild(energyCostSection);
      
      // Damage
      const damageSection = document.createElement('div');
      damageSection.className = 'damage-section';
      
      const damageLabel = document.createElement('label');
      damageLabel.textContent = 'Damage:';
      
      const damageInput = document.createElement('input');
      damageInput.type = 'text';
      damageInput.className = 'damage-input';
      damageInput.value = attack.damage;
      damageInput.placeholder = '30';
      
      damageInput.addEventListener('input', () => {
        this.updateAttackProperty(attack.id, 'damage', damageInput.value);
      });
      
      damageSection.appendChild(damageLabel);
      damageSection.appendChild(damageInput);
      
      body.appendChild(damageSection);
    }
    
    // Description (for both attacks and abilities)
    const descriptionSection = document.createElement('div');
    descriptionSection.className = 'description-section';
    
    const descriptionLabel = document.createElement('label');
    descriptionLabel.textContent = 'Description:';
    
    const descriptionInput = document.createElement('textarea');
    descriptionInput.className = 'description-input';
    descriptionInput.value = attack.description;
    descriptionInput.placeholder = attack.type === 'attack' ? 'Attack description...' : 'Ability description...';
    
    descriptionInput.addEventListener('input', () => {
      this.updateAttackProperty(attack.id, 'description', descriptionInput.value);
    });
    
    descriptionSection.appendChild(descriptionLabel);
    descriptionSection.appendChild(descriptionInput);
    
    body.appendChild(descriptionSection);
    
    // Assemble attack form
    attackElement.appendChild(header);
    attackElement.appendChild(body);
    
    if (existingElement) {
      // Replace existing element
      existingElement.replaceWith(attackElement);
    } else {
      // Add to container
      this.attackContainer.appendChild(attackElement);
    }
  }
  
  /**
   * Update the card content
   */
  updateContent() {
    // Sort attacks by order
    const sortedAttacks = [...this.attacks].sort((a, b) => a.order - b.order);
    
    // Find the card attack container
    const cardAttackContainer = document.querySelector('.attack-container');
    if (!cardAttackContainer) return;
    
    // Clear the container
    cardAttackContainer.innerHTML = '';
    
    // Create abilities first
    const abilities = sortedAttacks.filter(item => item.type === 'ability');
    abilities.forEach(ability => {
      const abilityElement = this.createAbilityElement(ability);
      cardAttackContainer.appendChild(abilityElement);
    });
    
    // Then create attacks
    const attacks = sortedAttacks.filter(item => item.type === 'attack');
    attacks.forEach(attack => {
      const attackElement = this.createAttackElement(attack);
      cardAttackContainer.appendChild(attackElement);
    });
  }
  
  /**
   * Create ability element for the card
   * @param {Object} ability - The ability data
   * @returns {HTMLElement} The ability element
   */
  createAbilityElement(ability) {
    const container = document.createElement('div');
    container.classList.add('ability-container');
    
    const header = document.createElement('div');
    header.classList.add('ability-header');
    
    const img = document.createElement('img');
    img.src = 'img/ability.png';
    
    const title = document.createElement('p');
    title.innerHTML = ability.name;
    
    const description = document.createElement('p');
    description.innerHTML = ability.description;
    
    header.appendChild(img);
    header.appendChild(title);
    container.appendChild(header);
    container.appendChild(description);
    
    return container;
  }
  
  /**
   * Create attack element for the card
   * @param {Object} attack - The attack data
   * @returns {HTMLElement} The attack element
   */
  createAttackElement(attack) {
    const container = document.createElement('div');
    container.classList.add('attack');
    
    const attackMain = document.createElement('div');
    attackMain.classList.add('attack-main');
    
    const attackCost = document.createElement('div');
    attackCost.classList.add('attack-cost');
    
    // Add energy icons
    attack.energyCost.forEach(energyType => {
      if (energyType) {
        const costImg = document.createElement('img');
        costImg.src = `img/energy/${energyType}-energy.png`;
        attackCost.appendChild(costImg);
      }
    });
    
    const attackName = document.createElement('p');
    attackName.classList.add('attack-name');
    attackName.innerHTML = attack.name;
    
    const attackDamage = document.createElement('p');
    attackDamage.classList.add('attack-damage');
    attackDamage.innerHTML = attack.damage;
    
    attackMain.appendChild(attackCost);
    attackMain.appendChild(attackName);
    attackMain.appendChild(attackDamage);
    container.appendChild(attackMain);
    
    if (attack.description) {
      const attackText = document.createElement('p');
      attackText.classList.add('attack-text');
      attackText.innerHTML = attack.description;
      container.appendChild(attackText);
    }
    
    return container;
  }
}

// Create and export a singleton instance
const attackManager = new AttackManager();

export default attackManager;