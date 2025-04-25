/**
 * File: js/modules/ui/tab-system.js
 * Purpose: Advanced tab system for the card editor UI
 * Dependencies: None
 * Notes: Provides a flexible tab system that works in both panels
 */

/**
 * TabSystem - Manages a tabbed interface
 */
class TabSystem {
    /**
     * Initialize the tab system
     * @param {string} tabNavigationSelector - Selector for the tab navigation container
     * @param {string} tabContentSelector - Selector for the tab content container
     */
    constructor(tabNavigationSelector, tabContentSelector) {
      this.tabNavigation = document.querySelector(tabNavigationSelector);
      this.tabContent = document.querySelector(tabContentSelector);
      
      if (!this.tabNavigation || !this.tabContent) {
        console.error(`Tab system initialization failed: containers not found for ${tabNavigationSelector} and ${tabContentSelector}`);
        return;
      }
      
      this.tabButtons = this.tabNavigation.querySelectorAll('.tab-button');
      this.tabPanels = this.tabContent.querySelectorAll('.tab-panel');
      
      this.activeTabId = null;
      this.setupEventListeners();
      
      // Activate the first tab by default
      if (this.tabButtons.length > 0) {
        const firstTabId = this.tabButtons[0].getAttribute('data-tab');
        this.activateTab(firstTabId);
      }
    }
    
    /**
     * Set up event listeners for tab buttons
     */
    setupEventListeners() {
      this.tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const tabId = button.getAttribute('data-tab');
          this.activateTab(tabId);
        });
      });
    }
    
    /**
     * Activate a specific tab
     * @param {string} tabId - The ID of the tab to activate
     */
    activateTab(tabId) {
      if (this.activeTabId === tabId) return; // Already active
      
      // Deactivate all tabs
      this.tabButtons.forEach(button => {
        button.classList.remove('active');
        button.setAttribute('aria-selected', 'false');
      });
      
      this.tabPanels.forEach(panel => {
        panel.classList.remove('active');
        panel.setAttribute('aria-hidden', 'true');
      });
      
      // Activate the selected tab
      const selectedButton = Array.from(this.tabButtons).find(
        button => button.getAttribute('data-tab') === tabId
      );
      
      const selectedPanel = document.getElementById(`${tabId}-panel`);
      
      if (selectedButton && selectedPanel) {
        selectedButton.classList.add('active');
        selectedButton.setAttribute('aria-selected', 'true');
        selectedPanel.classList.add('active');
        selectedPanel.setAttribute('aria-hidden', 'false');
        
        // Store the active tab
        this.activeTabId = tabId;
        
        // Dispatch a custom event that other modules can listen for
        const tabChangeEvent = new CustomEvent('tabchange', {
          detail: { tabId, panel: selectedPanel }
        });
        document.dispatchEvent(tabChangeEvent);
      }
    }
    
    /**
     * Get active tab ID
     * @returns {string|null} The active tab ID
     */
    getActiveTabId() {
      return this.activeTabId;
    }
    
    /**
     * Get active tab panel
     * @returns {HTMLElement|null} The active tab panel
     */
    getActiveTabPanel() {
      if (!this.activeTabId) return null;
      return document.getElementById(`${this.activeTabId}-panel`);
    }
    
    /**
     * Add a new tab
     * @param {string} tabId - The tab ID
     * @param {string} tabTitle - The tab title
     * @param {string} content - The tab content
     * @param {boolean} makeActive - Whether to make the new tab active
     * @returns {boolean} Success flag
     */
    addTab(tabId, tabTitle, content, makeActive = false) {
      // Check if tab already exists
      const existingButton = Array.from(this.tabButtons).find(
        button => button.getAttribute('data-tab') === tabId
      );
      
      if (existingButton) return false;
      
      // Create tab button
      const button = document.createElement('button');
      button.className = 'tab-button';
      button.setAttribute('data-tab', tabId);
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', 'false');
      button.setAttribute('aria-controls', `${tabId}-panel`);
      button.textContent = tabTitle;
      
      button.addEventListener('click', () => {
        this.activateTab(tabId);
      });
      
      // Create tab panel
      const panel = document.createElement('div');
      panel.id = `${tabId}-panel`;
      panel.className = 'tab-panel';
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('aria-labelledby', `${tabId}-tab`);
      panel.innerHTML = content;
      
      // Add to DOM
      this.tabNavigation.appendChild(button);
      this.tabContent.appendChild(panel);
      
      // Update cached elements
      this.tabButtons = this.tabNavigation.querySelectorAll('.tab-button');
      this.tabPanels = this.tabContent.querySelectorAll('.tab-panel');
      
      // Activate if requested
      if (makeActive) {
        this.activateTab(tabId);
      }
      
      return true;
    }
    
    /**
     * Remove a tab
     * @param {string} tabId - The ID of the tab to remove
     * @returns {boolean} Success flag
     */
    removeTab(tabId) {
      // Find tab elements
      const button = Array.from(this.tabButtons).find(
        button => button.getAttribute('data-tab') === tabId
      );
      
      const panel = document.getElementById(`${tabId}-panel`);
      
      if (!button || !panel) return false;
      
      // If removing active tab, activate another one first
      if (this.activeTabId === tabId) {
        // Find another tab to activate
        const anotherButton = Array.from(this.tabButtons).find(
          btn => btn.getAttribute('data-tab') !== tabId
        );
        
        if (anotherButton) {
          this.activateTab(anotherButton.getAttribute('data-tab'));
        } else {
          this.activeTabId = null;
        }
      }
      
      // Remove tab elements
      button.remove();
      panel.remove();
      
      // Update cached elements
      this.tabButtons = this.tabNavigation.querySelectorAll('.tab-button');
      this.tabPanels = this.tabContent.querySelectorAll('.tab-panel');
      
      return true;
    }
    
    /**
     * Update a tab's content
     * @param {string} tabId - The ID of the tab to update
     * @param {string} content - The new content
     * @returns {boolean} Success flag
     */
    updateTabContent(tabId, content) {
      const panel = document.getElementById(`${tabId}-panel`);
      if (!panel) return false;
      
      panel.innerHTML = content;
      return true;
    }
    
    /**
     * Update a tab's title
     * @param {string} tabId - The ID of the tab to update
     * @param {string} title - The new title
     * @returns {boolean} Success flag
     */
    updateTabTitle(tabId, title) {
      const button = Array.from(this.tabButtons).find(
        button => button.getAttribute('data-tab') === tabId
      );
      
      if (!button) return false;
      
      button.textContent = title;
      return true;
    }
  }
  
  /**
   * Initialize all tab systems on the page
   */
  function initTabSystems() {
    // Check if we should use the new tabbed layout
    const useTabbedLayout = true; // Set to false to disable
    
    if (!useTabbedLayout) return;
    
    // Left panel tabs (card properties)
    window.leftTabSystem = new TabSystem('.panel-left .tab-navigation', '.panel-left .tab-content');
    
    // Right panel tabs (layers, effects, sets)
    window.rightTabSystem = new TabSystem('.panel-right .tab-navigation', '.panel-right .tab-content');
    
    // Create tabs for specific layer types in the right panel
    createLayerTypeTabs();
    
    // Listen for layer selection changes
    document.addEventListener('layerselected', (e) => {
      const layerId = e.detail.layerId;
      updateRightPanelForLayer(layerId);
    });
  }
  
  /**
   * Create tabs for specific layer types
   */
  function createLayerTypeTabs() {
    // Create tabs if they don't exist yet
    const rightTabNav = document.querySelector('.panel-right .tab-navigation');
    if (!rightTabNav) return;
    
    // Check if tabs already exist
    const layerTab = rightTabNav.querySelector('[data-tab="layers"]');
    const type1Tab = rightTabNav.querySelector('[data-tab="type1"]');
    const type2Tab = rightTabNav.querySelector('[data-tab="type2"]');
    
    // Add missing tabs
    if (!layerTab && window.rightTabSystem) {
      window.rightTabSystem.addTab('layers', 'Layers', createLayersTabContent(), true);
    }
    
    if (!type1Tab && window.rightTabSystem) {
      window.rightTabSystem.addTab('type1', 'Primary Type', createType1TabContent(), false);
    }
    
    if (!type2Tab && window.rightTabSystem) {
      window.rightTabSystem.addTab('type2', 'Secondary Type', createType2TabContent(), false);
    }
  }
  
  /**
   * Update right panel based on selected layer
   * @param {string} layerId - The ID of the selected layer
   */
  function updateRightPanelForLayer(layerId) {
    if (!window.rightTabSystem || !layerManager) return;
    
    // Get the layer
    const layer = layerManager.getLayerById(layerId);
    if (!layer) return;
    
    // Activate the appropriate tab based on layer type
    if (layer.systemType === 'type1') {
      window.rightTabSystem.activateTab('type1');
      window.rightTabSystem.updateTabTitle('type1', `${layer.name}`);
    } 
    else if (layer.systemType === 'type2') {
      window.rightTabSystem.activateTab('type2');
      window.rightTabSystem.updateTabTitle('type2', `${layer.name}`);
    } 
    else {
      window.rightTabSystem.activateTab('layers');
    }
  }
  
  /**
   * Create content for the layers tab
   * @returns {string} HTML content
   */
  function createLayersTabContent() {
    return `
      <div class="panel-section">
        <h3>Layers</h3>
        <div id="layer-list" class="layer-list"></div>
        <div class="layer-buttons">
          <button id="add-layer-btn" class="action-button">Add Layer</button>
          <button id="remove-layer-btn" class="action-button">Remove Layer</button>
        </div>
      </div>
      <div id="layer-properties-tab" class="panel-section">
        <h3 id="layer-properties-title">Layer Properties</h3>
        <div class="property-group">
          <label for="layer-name">Name:</label>
          <input type="text" id="layer-name" class="property-input">
        </div>
        <div class="property-group">
          <label for="layer-opacity">Opacity:</label>
          <input type="range" id="layer-opacity" class="property-input" min="0" max="100" value="100">
          <span class="value-display">100%</span>
        </div>
        <div class="property-group">
          <label for="layer-blend-mode">Blend Mode:</label>
          <select id="layer-blend-mode" class="property-input">
            <option value="normal">Normal</option>
            <option value="multiply">Multiply</option>
            <option value="screen">Screen</option>
            <option value="overlay">Overlay</option>
            <option value="darken">Darken</option>
            <option value="lighten">Lighten</option>
            <option value="color-dodge">Color Dodge</option>
            <option value="color-burn">Color Burn</option>
            <option value="hard-light">Hard Light</option>
            <option value="soft-light">Soft Light</option>
            <option value="difference">Difference</option>
            <option value="exclusion">Exclusion</option>
          </select>
        </div>
        <div class="property-group">
          <label for="mask-selector">Mask:</label>
          <select id="mask-selector" class="property-input">
            <option value="">None</option>
            <option value="img/mask.png">Default Mask</option>
            <option value="img/masks/horizontal-split.png">Horizontal Split</option>
            <option value="img/masks/vertical-split.png">Vertical Split</option>
            <option value="img/masks/gradient-fade.png">Gradient Fade</option>
            <option value="img/masks/circle-center.png">Circle Center</option>
          </select>
        </div>
        <div class="property-group">
          <label>Position:</label>
          <div class="position-inputs">
            <div>
              <label for="layer-x">X:</label>
              <input type="number" id="layer-x" class="property-input small" value="0">
            </div>
            <div>
              <label for="layer-y">Y:</label>
              <input type="number" id="layer-y" class="property-input small" value="0">
            </div>
          </div>
        </div>
        <div class="property-group">
          <label>Size:</label>
          <div class="size-inputs">
            <div>
              <label for="layer-width">W:</label>
              <input type="number" id="layer-width" class="property-input small" value="100">
            </div>
            <div>
              <label for="layer-height">H:</label>
              <input type="number" id="layer-height" class="property-input small" value="100">
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Create content for the primary type tab
   * @returns {string} HTML content
   */
  function createType1TabContent() {
    return `
      <div class="panel-section">
        <h3 id="type1-tab-title">Primary Type</h3>
        <div class="property-group">
          <label for="card-set">Card Set:</label>
          <select id="card-set" class="property-input">
            <option value="Classic">Original Set</option>
            <option value="QuantumContour">Quantum Contour</option>
            <option value="SwordShield">Sword & Shield</option>
          </select>
        </div>
        <div class="property-group">
          <label for="primary-type-selector">Type:</label>
          <div id="primary-type-selector" class="type-grid">
            <!-- Type icons will be populated dynamically -->
          </div>
        </div>
        <div class="property-group">
          <label for="holo-effect">Holographic Effect:</label>
          <input type="checkbox" id="holo-effect" class="property-input">
        </div>
        <div class="property-group">
          <label for="layer-opacity-type1">Opacity:</label>
          <input type="range" id="layer-opacity-type1" class="property-input" min="0" max="100" value="100">
          <span class="value-display">100%</span>
        </div>
        <div class="property-group">
          <label for="type1-image-upload">Custom Background:</label>
          <button id="type1-image-upload" class="action-button">Upload Image</button>
        </div>
      </div>
    `;
  }
  
  /**
   * Create content for the secondary type tab
   * @returns {string} HTML content
   */
  function createType2TabContent() {
    return `
      <div class="panel-section">
        <h3 id="type2-tab-title">Secondary Type</h3>
        <div class="property-group">
          <label for="dual-card-set">Card Set:</label>
          <select id="dual-card-set" class="property-input">
            <option value="Classic">Original Set</option>
            <option value="QuantumContour">Quantum Contour</option>
            <option value="SwordShield">Sword & Shield</option>
          </select>
        </div>
        <div class="property-group">
          <label for="secondary-type-selector">Type:</label>
          <div id="secondary-type-selector" class="type-grid">
            <!-- Secondary type icons will be populated dynamically -->
          </div>
        </div>
        <div class="property-group">
          <label for="mask-selector-type2">Mask:</label>
          <select id="mask-selector-type2" class="property-input">
            <option value="">Default Split (Diagonal)</option>
            <option value="img/mask.png">Standard Mask</option>
            <option value="img/masks/horizontal-split.png">Horizontal Split</option>
            <option value="img/masks/vertical-split.png">Vertical Split</option>
            <option value="img/masks/gradient-fade.png">Gradient Fade</option>
            <option value="img/masks/circle-center.png">Circle Center</option>
          </select>
        </div>
        <div class="property-group">
          <label for="layer-blend-mode-type2">Blend Mode:</label>
          <select id="layer-blend-mode-type2" class="property-input">
            <option value="normal">Normal</option>
            <option value="multiply">Multiply</option>
            <option value="screen">Screen</option>
            <option value="overlay">Overlay</option>
            <option value="darken">Darken</option>
            <option value="lighten">Lighten</option>
            <option value="color-dodge">Color Dodge</option>
            <option value="color-burn">Color Burn</option>
            <option value="hard-light">Hard Light</option>
            <option value="soft-light">Soft Light</option>
            <option value="difference">Difference</option>
            <option value="exclusion">Exclusion</option>
          </select>
        </div>
        <div class="property-group">
          <label for="layer-opacity-type2">Opacity:</label>
          <input type="range" id="layer-opacity-type2" class="property-input" min="0" max="100" value="100">
          <span class="value-display">100%</span>
        </div>
        <div class="property-group">
          <label for="type2-image-upload">Custom Background:</label>
          <button id="type2-image-upload" class="action-button">Upload Image</button>
        </div>
      </div>
    `;
  }
  
  // Add tabs for the left panel (card properties)
  function initLeftPanelTabs() {
    if (!window.leftTabSystem) return;
    
    // Create tabs if they don't exist yet
    const leftTabNav = document.querySelector('.panel-left .tab-navigation');
    if (!leftTabNav) return;
    
    // Check if tabs already exist
    const basicInfoTab = leftTabNav.querySelector('[data-tab="basic-info"]');
    const gameStatsTab = leftTabNav.querySelector('[data-tab="game-stats"]');
    const attacksTab = leftTabNav.querySelector('[data-tab="attacks"]');
    
    // Add missing tabs
    if (!basicInfoTab && window.leftTabSystem) {
      window.leftTabSystem.addTab('basic-info', 'Basic Info', createBasicInfoContent(), true);
    }
    
    if (!gameStatsTab && window.leftTabSystem) {
      window.leftTabSystem.addTab('game-stats', 'Game Stats', createGameStatsContent(), false);
    }
    
    if (!attacksTab && window.leftTabSystem) {
      window.leftTabSystem.addTab('attacks', 'Attacks & Abilities', createAttacksContent(), false);
    }
  }
  
  /**
   * Create content for the basic info tab
   * @returns {string} HTML content
   */
  function createBasicInfoContent() {
    return `
      <div class="panel-section">
        <h3>Card Info</h3>
        <div class="property-group">
          <label for="name">Name:</label>
          <input type="text" id="name" name="name" class="property-input">
        </div>
        <div class="property-group">
          <label for="hp">HP:</label>
          <input type="number" id="hp" name="hp" class="property-input">
        </div>
        <div class="property-group">
          <label for="stage">Stage:</label>
          <select id="stage" name="stage" class="property-input">
            <option value="basic">Basic</option>
            <option value="stage-1">Stage 1</option>
            <option value="stage-2">Stage 2</option>
          </select>
        </div>
        <div class="property-group evolution-info">
          <label for="evolves-from">Evolves from:</label>
          <input type="text" id="evolves-from" name="evolves-from" class="property-input">
        </div>
      </div>
      <div class="panel-section">
        <h3>Pokémon Info</h3>
        <div class="property-group">
          <label for="category">Category:</label>
          <input type="text" id="category" name="category" class="property-input" placeholder="Lizard">
        </div>
        <div class="property-group">
          <label for="pokedex-number">Pokédex #:</label>
          <input type="number" id="pokedex-number" name="pokedex-number" class="property-input">
        </div>
        <div class="property-group">
          <label class="ht">Height:</label>
          <input type="number" id="feet" name="feet" class="property-input small" placeholder="3">
          <span>'</span>
          <input type="number" id="inches" name="inches" class="property-input small" placeholder="7">
          <span>"</span>
        </div>
        <div class="property-group">
          <label for="weight">Weight:</label>
          <input type="number" id="weight" name="weight" class="property-input" placeholder="85">
          <span>lbs.</span>
        </div>
      </div>
      <div class="panel-section">
        <h3>Images</h3>
        <div class="property-group">
          <label>Main Image:</label>
          <div class="img-drop">Drop Pokémon image here.</div>
        </div>
        <div class="property-group evolution-image">
          <label>Pre-evolution Image:</label>
          <div class="img-drop-small">Drop pre-evolution image here.</div>
        </div>
      </div>
    `;
  }
  
  /**
   * Create content for the game stats tab
   * @returns {string} HTML content
   */
  function createGameStatsContent() {
    return `
      <div class="panel-section">
        <h3>Weakness & Resistance</h3>
        <div class="property-group">
          <div class="weakness-selector">
            <label for="weakness-dropdown">Weakness:</label>
            <div id="weakness-dropdown" class="dropdown-container">
              <div class="current-type" id="current-weakness"></div>
              <div class="arrowbox"><i id="weakness-arrow" class="arrow down"></i></div>
            </div>
            <ul id="weakness-list" class="dropdown">
              <!-- Type icons will be populated dynamically -->
            </ul>
          </div>
        </div>
        <div class="property-group">
          <div class="resistance-selector">
            <label for="resistance-dropdown">Resistance:</label>
            <div id="resistance-dropdown" class="dropdown-container">
              <div class="current-type" id="current-resistance"></div>
              <div class="arrowbox"><i id="resistance-arrow" class="arrow down"></i></div>
            </div>
            <ul id="resistance-list" class="dropdown">
              <!-- Type icons will be populated dynamically -->
            </ul>
          </div>
        </div>
      </div>
      <div class="panel-section">
        <h3>Retreat Cost</h3>
        <div class="property-group">
          <label for="retreat">Retreat Cost:</label>
          <select id="retreat" name="retreat" class="property-input">
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
      </div>
    `;
  }
  
  /**
   * Create content for the attacks tab
   * @returns {string} HTML content
   */
  function createAttacksContent() {
    return `
      <div class="panel-section">
        <h3>Attacks & Abilities</h3>
        <div class="action-buttons">
          <button id="add-attack-btn" class="action-button">Add Attack</button>
          <button id="add-ability-btn" class="action-button">Add Ability</button>
        </div>
        <div id="attack-container" class="attack-container">
          <!-- Attacks will be populated dynamically -->
        </div>
      </div>
    `;
  }
  
  // Initialize when the DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    initTabSystems();
    initLeftPanelTabs();
  });
  
  export default TabSystem;