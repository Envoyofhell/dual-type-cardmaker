// Global utility functions
window.updateCardBackground = function(type, stage) {
  const card = document.getElementById('card');
  if (!card || !type || !stage) return;
  
  // Remove existing class
  if (window.pastStage !== '' && window.pastType !== '') {
    card.classList.remove('card-' + window.pastType + '-' + window.pastStage);
  }
  
  // Get the set data
  const setKey = window.currentSet || 'Classic';
  
  // Check if we're using Quantum Contour
  if (setKey === 'QuantumContour') {
    // Use custom image paths for Quantum Contour
    const typeFormatted = type.charAt(0).toUpperCase() + type.slice(1);
    let stageCode = 'S0';
    if (stage === 'stage-1') stageCode = 'S1';
    if (stage === 'stage-2') stageCode = 'S2';
    
    const path = `img/QuantumContour/${typeFormatted}/P - ${typeFormatted} - ${stageCode}.png`;
    card.style.backgroundImage = `url('${path}')`;
    // Remove class-based styling
    card.className = '';
  } else {
    // Default Classic set using CSS classes
    card.style.backgroundImage = '';
    card.classList.add('card-' + type + '-' + stage);
  }
};