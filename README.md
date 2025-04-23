# Pokémon TCG Card Maker - Dual Type Enhancement

## Introduction

This project enhances an existing web-based Pokémon TCG card maker application. The primary motivation, driven by user interest, was to implement a more robust, flexible, and optimized system for creating and downloading custom **Dual Type** Pokémon cards.

## Problem & Motivation

Representing Dual Type Pokémon cards accurately presents unique challenges:

1.  **Visual Blending/Splitting:** Simply overlaying two type backgrounds isn't visually appealing or accurate to official card designs. A method is needed to blend or split the two background layers effectively.
2.  **Mask Flexibility:** Users desired the ability to use different visual styles for the type split, moving beyond a single hardcoded effect (like a simple diagonal `clip-path`). This required supporting custom mask images (e.g., PNGs with transparency).
3.  **Preview vs. Download Consistency:** Early methods using CSS (`clip-path` or `mask-image`) applied via JavaScript sometimes resulted in inconsistencies between the live preview and the final image generated for download (using libraries like `html2canvas`). Styles applied dynamically weren't always captured accurately.

## Solution Implemented

To address these challenges, the following approach was implemented:

1.  **Centralized Mask Logic (`mask-manager.js`):**
    * A dedicated JavaScript module (`mask-manager.js`) was created to handle all logic related to applying visual masks or splits.
    * It reads the user's selection from a dedicated dropdown menu (`#mask-selector`) in the HTML.
    * It contains a core function (`applyMaskStyle`) that intelligently applies *either* CSS `mask-image` (if a valid mask file URL is selected) *or* a default CSS `clip-path` polygon (if the "None" or default option is selected) to the second type layer (`#second-card-layer`).
    * This ensures the same logic governs both the live preview and the preparation step for downloading.

2.  **CSS `mask-image` Support:**
    * The system now primarily uses the `mask-image` CSS property (and its `-webkit-` prefix) to apply user-selected mask files (like `img/mask.png` or others added to the dropdown).
    * This allows for complex visual effects defined by PNG transparency or grayscale values, offering much more creative freedom than `clip-path` alone.

3.  **Refined Download Process (`card-download.js`):**
    * The download functionality was updated to work reliably with the masking system.
    * The current approach utilizes `html2canvas` to capture the card preview.
    * To ensure consistency, the preparation step (`prepareCardForSimpleCapture`) explicitly calls the `maskManager.applyMaskStyle` function on the *cloned* card element before capture, ensuring the same mask/clip-path logic used in the preview is applied to the element being captured.

## Key Features & Improvements

* **Flexible Dual-Type Visuals:** Users can select different mask effects via a dropdown, including using custom `mask.png` files.
* **Consistent Output:** The centralized `mask-manager.js` ensures the downloaded card accurately matches the live preview.
* **Modular Code:** Separating mask logic into `mask-manager.js` makes the code easier to understand, maintain, and extend.
* **Optimized Workflow:** Streamlined the process for creating and saving dual-type cards.

This enhanced system provides a more powerful and reliable way for users to create custom Dual Type Pokémon cards with the desired visual flair.