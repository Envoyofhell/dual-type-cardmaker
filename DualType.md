## Dual Type System Explained

This document explains how the Dual Type functionality works in the Pokémon Card Maker.

**Purpose:**

The primary goal of the Dual Type system is to visually represent two distinct Pokémon types on a single card. This involves creating a second visual layer on top of the base card background and controlling how these two layers interact visually, often using a mask or a split effect.

**Key Files Involved:**

1.  **`index.html`**:
    * Contains the "Dual Type" checkbox (`<input type="checkbox" id="dual-type-toggle">`).
    * Contains the hidden section for selecting the second type (`<div id="second-type-selector">`) with its list (`<ul id="second-type-list">`).
    * Contains the dropdown menu for selecting the visual mask (`<select id="mask-selector">`).
    * The main card preview area (`<div id="card">`) is where the second layer (`#second-card-layer`) will be added dynamically.

2.  **`dual-type-simple.js`**:
    * Handles the logic triggered by the "Dual Type" checkbox and the second type selection.
    * Creates (`updateSecondLayer`) and removes (`removeSecondLayer`) the second visual layer (`<div id="second-card-layer">`).
    * Sets the correct background image for the second layer based on the selected second type and the Pokémon's stage.
    * Calls the `maskManager` script to apply the visual mask or split effect after creating the layer.
    * Contains `preserveCardFormatting` to try and ensure card content (name, HP, attacks) stays visually on top of the background layers.

3.  **`mask-manager.js`**:
    * **Central Logic:** This script now handles all logic related to applying the visual effect (mask image or clip-path) that separates the two types.
    * Listens for changes in the `#mask-selector` dropdown.
    * Contains the `applyMaskStyle` function, which applies the correct CSS (`mask-image` or `clip-path`) to the target element (`#second-card-layer` for the preview).

4.  **CSS (`style.css`, `dual-type-simple.css`)**:
    * Provides styling for the dual-type toggle checkbox, the second type selector buttons, and potentially base styles for the `#second-card-layer` (though most visual styling like `mask-image` or `clip-path` is now handled by `mask-manager.js`).

**Workflow:**

1.  **Enable Dual Type:** The user checks the "Dual Type" checkbox (`#dual-type-toggle`).
2.  **Show Selector:** The event listener in `dual-type-simple.js` detects the check, sets the `isDualType` flag to `true`, and makes the second type selector section (`#second-type-selector`) visible.
3.  **Select Second Type:** The user clicks on an image in the second type list (`#second-type-list`).
4.  **Store Second Type:** The event listener in `dual-type-simple.js` updates the `secondType` variable with the selected type (e.g., 'water').
5.  **Create Layer:** Because `isDualType` is true and `secondType` now has a value, the `updateSecondLayer` function in `dual-type-simple.js` is called.
6.  **Set Background:** `updateSecondLayer` determines the correct background image URL based on the current stage and the selected `secondType`.
7.  **Add Layer to DOM:** It creates a new `div` element with the ID `#second-card-layer`, sets its base styles (position, size, z-index, background image), and adds it to the main card element (`#card`), usually by prepending it so it sits behind the main content container (`.card-container`).
8.  **Apply Mask/Split:** Crucially, `updateSecondLayer` calls `window.maskManager.applyCurrentMaskStyle()` (often within a `requestAnimationFrame` or `setTimeout` to ensure the layer exists in the DOM).
9.  **Mask Manager Action:** `maskManager.applyCurrentMaskStyle()` gets the currently selected value from the `#mask-selector` dropdown and calls its internal `applyMaskStyle` function, passing the `#second-card-layer` element and the selected mask URL (or an empty string).
10. **CSS Application:** `applyMaskStyle` applies *either* the `mask-image` CSS properties (if a URL like `img/mask.png` was selected) *or* the `clip-path: polygon(...)` CSS property (if the "None" or default option with `value=""` was selected) to the `#second-card-layer`, creating the visual split or mask effect.
11. **Content Formatting:** `dual-type-simple.js` calls `preserveCardFormatting` to reiterate the `z-index` and `position` styles for the main card content elements, ensuring they appear above the newly added second layer.
12. **Disable Dual Type:** If the user unchecks the "Dual Type" checkbox, `removeSecondLayer` is called, which finds and removes the `#second-card-layer` element from the DOM.

This separation ensures that the core dual-type logic focuses on creating the layer and its background, while the dedicated `mask-manager.js` handles the specific visual effect based on the user's dropdown choice.