/**
 * File: js/modules/ui/tabs.js
 * Purpose: Provides tab functionality for the UI
 * Dependencies: None
 * Notes: Core UI component that manages tab switching
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
        console.error('Tab system initialization failed: containers not found');
        return;
      }
      
      this.tabButtons = this.tabNavigation.querySelectorAll('.tab-button');
      this.tabPanels = this.tabContent.querySelectorAll('.tab-panel');
      
      this.setupEventListeners();
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
      // Deactivate all tabs
      this.tabButtons.forEach(button => {
        button.classList.remove('active');
      });
      
      this.tabPanels.forEach(panel => {
        panel.classList.remove('active');
      });
      
      // Activate the selected tab
      const selectedButton = Array.from(this.tabButtons).find(
        button => button.getAttribute('data-tab') === tabId
      );
      
      const selectedPanel = document.getElementById(`${tabId}-panel`);
      
      if (selectedButton && selectedPanel) {
        selectedButton.classList.add('active');
        selectedPanel.classList.add('active');
        
        // Dispatch a custom event that other modules can listen for
        const tabChangeEvent = new CustomEvent('tabchange', {
          detail: { tabId }
        });
        document.dispatchEvent(tabChangeEvent);
      }
    }
  }
  
  /**
   * Initialize all tab systems on the page
   */
  function initTabSystems() {
    // Left panel tabs
    new TabSystem('.panel-left .tab-navigation', '.panel-left .tab-content');
    
    // Right panel tabs
    new TabSystem('.panel-right .tab-navigation', '.panel-right .tab-content');
  }
  
  // Initialize when the DOM is loaded
  document.addEventListener('DOMContentLoaded', initTabSystems);
  
  // Export the TabSystem class for use in other modules
  export default TabSystem;