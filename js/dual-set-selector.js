// Add dual type set selector
(function() {
    // Create the dual set selector
    function initDualSetSelector() {
      const secondTypeSelector = document.getElementById('second-type-selector');
      if (!secondTypeSelector) return;
      
      // Create container
      const dualSetSelector = document.createElement('div');
      dualSetSelector.id = 'dual-set-selector';
      dualSetSelector.className = 'hidden';
      dualSetSelector.innerHTML = `
        <p style="margin-top:10px;">Second Type Set:</p>
        <select id="dual-card-set" name="dual-card-set">
          <option value="Classic">Original Set</option>
          <option value="QuantumContour">Quantum Contour</option>
        </select>
      `;
      
      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        #dual-set-selector {
          width: 100%;
          text-align: center;
          margin-top: 10px;
        }
        #dual-set-selector.hidden {
          display: none;
        }
        #dual-card-set {
          width: 80%;
          height: 25px;
          font-size: 12pt;
          background-color: white;
          box-shadow: 0 0 15px var(--darkred) inset;
          border: 1px solid white;
          border-radius: 4px;
          margin-top: 5px;
        }
      `;
      document.head.appendChild(style);
      
      // Add to DOM
      secondTypeSelector.appendChild(dualSetSelector);
      
      // Set up change event
      const dualSetSelect = document.getElementById('dual-card-set');
      dualSetSelect.addEventListener('change', function() {
        window.dualTypeSet = this.value;
        if (window.dualTypeSimple && typeof window.dualTypeSimple.updateSecondLayer === 'function') {
          window.dualTypeSimple.updateSecondLayer();
        }
      });
      
      // Update dual type toggle to show/hide the selector
      const dualTypeToggle = document.getElementById('dual-type-toggle');
      if (dualTypeToggle) {
        // Keep existing functionality but add selector toggle
        const originalClickHandler = dualTypeToggle.onclick;
        dualTypeToggle.onclick = function() {
          // Call original handler if it exists
          if (typeof originalClickHandler === 'function') {
            originalClickHandler.call(this);
          }
          
          // Toggle dual set selector visibility
          const dualSetSelector = document.getElementById('dual-set-selector');
          if (dualSetSelector) {
            if (this.checked) {
              dualSetSelector.classList.remove('hidden');
            } else {
              dualSetSelector.classList.add('hidden');
            }
          }
        };
      }
    }
    
    // Initialize when document is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initDualSetSelector);
    } else {
      initDualSetSelector();
    }
  })();