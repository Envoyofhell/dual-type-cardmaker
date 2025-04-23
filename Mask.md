## Mask System Explained

This document explains how the visual masking/splitting system for Dual Type cards works in the Pokémon Card Maker, primarily managed by `mask-manager.js`.

**Purpose:**

When a card is set to Dual Type, a second background layer (`#second-card-layer`) representing the second type is added. The Mask System controls how this second layer is visually revealed or blended with the primary type layer underneath it. It allows for different visual effects beyond a simple overlay, typically using either:

1.  **CSS `mask-image`:** Uses an image file (PNG or SVG) where transparency or grayscale values define which parts of the second layer are visible.
2.  **CSS `clip-path`:** Uses a geometric shape (like a polygon) to cut out a portion of the second layer, revealing the layer below. This is used as the default diagonal split effect when no specific mask image is selected.

**Key Files Involved:**

1.  **`index.html`**:
    * Contains the dropdown menu (`<select id="mask-selector">`) where users choose the desired mask effect.
    * Each `<option>` within the select has a `value` attribute:
        * If the value is a path (e.g., `"img/mask.png"`), it refers to a mask image file.
        * If the value is an empty string (`""`), it signifies that the default `clip-path` effect should be used.

2.  **`mask-manager.js`**:
    * **Central Logic:** This script is the core of the mask system.
    * It finds the `#mask-selector` dropdown on page load (`initMaskManager`).
    * It stores the currently selected mask URL in the `currentSelectedMaskUrl` variable.
    * It listens for `change` events on the dropdown (`handleMaskChange`).
    * It contains the main function `applyMaskStyle(targetElement, maskUrl)` which takes an HTML element and a mask URL, resets conflicting styles, and applies *either* the `mask-image` properties *or* the `clip-path` property based on the provided `maskUrl`.
    * It provides `applyCurrentMaskStyle()` to specifically target the live preview layer (`#second-card-layer`) with the currently selected mask from the dropdown.
    * It exposes functions (`window.maskManager`) for other scripts to use.

3.  **`dual-type-simple.js`**:
    * When creating the second layer (`updateSecondLayer`), it calls `window.maskManager.applyCurrentMaskStyle()` (usually via `requestAnimationFrame` or `setTimeout`) to apply the selected mask/clip effect to the newly added `#second-card-layer` in the preview.

4.  **`card-download.js`**:
    * When preparing the card *clone* for download (`prepareCardForSimpleCapture`), it retrieves the currently selected mask URL using `window.maskManager.getCurrentMaskUrl()`.
    * It then calls `window.maskManager.applyMaskStyle()` passing the *cloned* second layer element and the retrieved mask URL. This ensures the downloaded image uses the same masking logic as the preview.

5.  **Mask Image Files (`img/mask.png`, `img/mask/...`)**:
    * These are the actual image files used by the `mask-image` CSS property.
    * They are typically PNG files.
    * **How they work:**
        * **Transparency:** Fully transparent areas of the PNG will make the corresponding part of the `#second-card-layer` *invisible*, showing the layer below.
        * **Opacity:** Fully opaque areas of the PNG will make the corresponding part of the `#second-card-layer` *fully visible*.
        * **Semi-Transparency (Alpha):** Areas with partial transparency (alpha values between 0 and 1) will make the `#second-card-layer` partially visible, creating a blending effect.
        * **Grayscale:** Often, masks use grayscale. White typically corresponds to fully visible, black to fully transparent, and shades of gray to varying levels of transparency/visibility. This allows for smooth gradients and complex blending effects.
    * SVGs can also be used for masking.

**Workflow:**

1.  **Initialization:** `mask-manager.js` loads, finds the `#mask-selector`, and stores its initial value (e.g., `""` for the default clip-path).
2.  **Dual Type Activated:** User enables dual type and selects a second type. `dual-type-simple.js` creates the `#second-card-layer` and calls `maskManager.applyCurrentMaskStyle()`.
3.  **Initial Style Applied:** `maskManager.applyCurrentMaskStyle()` calls `applyMaskStyle` with the `#second-card-layer` and the current URL (initially `""`). `applyMaskStyle` sees the empty URL, resets mask styles, and applies the default `clip-path: polygon(...)`. The preview shows the diagonal split.
4.  **User Selects Mask:** User selects "Mask File (mask.png)" from the dropdown.
5.  **Change Detected:** The `change` event listener in `mask-manager.js` (`handleMaskChange`) fires.
6.  **URL Updated:** `handleMaskChange` updates `currentSelectedMaskUrl` to `"img/mask.png"`.
7.  **Style Re-Applied:** `handleMaskChange` calls `applyCurrentMaskStyle()`, which in turn calls `applyMaskStyle` with the `#second-card-layer` and the new URL `"img/mask.png"`.
8.  **Mask Applied:** `applyMaskStyle` sees the non-empty URL, resets clip-path styles, and applies the `mask-image: url("img/mask.png")` styles (and related properties) to the `#second-card-layer`. The preview updates to show the effect defined by the `mask.png` file.
9.  **Download:** User clicks download. `card-download.js` prepares a clone. `prepareCardForSimpleCapture` calls `maskManager.getCurrentMaskUrl()` (which returns `"img/mask.png"`) and then calls `maskManager.applyMaskStyle()` on the *cloned* second layer with that URL, ensuring the downloaded image reflects the selected mask.

This centralized approach ensures that the logic for interpreting the dropdown selection and applying the corresponding visual effect (mask or clip-path) is consistent across both the live preview and the download process.