// js/sets.js - Central set configuration

// Set prefix mapping (used by build script and UI)
const SET_PREFIX_MAP = {
    'P': 'Quantum Contour',
    'SS': 'Sword & Shield'
    // Add more sets as needed
  };
  
  // Detailed set configuration
  const SETS_CONFIG = {
    'Classic': {
      name: 'Original Set',
      path: '', // Uses CSS classes instead of images
      cssClassBased: true,
      order: 1
    },
    'QuantumContour': {
      name: 'Quantum Contour',
      prefix: 'P',
      path: 'img/QuantumContour',
      filenameFormat: '{prefix}- {type} - {stage}',
      stageFormat: {
        'basic': 'S0',
        'stage-1': 'S1',
        'stage-2': 'S2'
      },
      order: 2
    },
    'SwordShield': {
      name: 'Sword & Shield',
      prefix: 'SS',
      path: 'img/SwordShield',
      filenameFormat: '{prefix}_{stageClass}_{type}',
      stageFormat: {
        'basic': 'Basic',
        'stage-1': 'Stage1',
        'stage-2': 'Stage2'
      },
      order: 3
    }
  };
  
  // Export for Node.js (build script)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      SET_PREFIX_MAP,
      SETS_CONFIG
    };
  }
  
  // Export for browser
  if (typeof window !== 'undefined') {
    window.SET_PREFIX_MAP = SET_PREFIX_MAP;
    window.SETS_CONFIG = SETS_CONFIG;
  }