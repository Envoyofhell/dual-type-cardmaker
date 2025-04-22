# Dual-Type Pokemon Card Implementation Guide

This guide explains how to add dual-type functionality to your Pokemon Card Maker without modifying your original code.

## Overview

The dual-type feature allows users to create Pokemon cards that blend two different type backgrounds using a mask image. The implementation consists of:

1. A separate JavaScript file (`dual-type.js`)
2. A default mask image (`mask.png`)
3. Minimal changes to your HTML file to include the script

## Implementation Steps

### Step 1: Add the Dual-Type Script

1. Save the `dual-type.js` script (from the "dual-type-script" artifact) into your project folder.

2. Add the script to your HTML file by adding this line before the closing `</body>` tag:

```html
<script src="dual-type.js"></script>
```

### Step 2: Create a Default Mask Image

1. Create a `mask.png` file as described in the "mask-image" artifact.
2. Save it in your `img` folder.

The mask determines which parts of the card show the primary type (white areas) and which show the secondary type (black areas).

## How It Works

The dual-type script:

1. Adds the necessary UI elements (toggle, type selector, drop zones)
2. Sets up event handlers for all new elements
3. Captures the original card image when it's dropped
4. Provides functionality to composite images using the mask

When a user enables dual-type mode:
- They can select a secondary type
- They can drop a custom mask image (or use the default)
- The script creates a composite image blending both type backgrounds

## UI Elements Added

The script automatically adds these UI elements:

1. **Dual-type toggle**: A checkbox to enable/disable dual-type functionality
2. **Secondary type selector**: Icons to choose the second type
3. **Mask drop zone**: Area to drop a custom mask image
4. **Secondary type drop zone**: Area to drop a custom secondary type image

## Customization

### Default Mask

You can customize the default mask by replacing the `mask.png` file in your `img` folder. This mask determines how the two types blend together.

### Type Backgrounds

For the secondary type background images, the script looks for files in this format:
```
img/{type-name}-background.png
```

Create these files for each type (e.g., `fire-background.png`, `water-background.png`), or modify the script to use your existing type background images.

## Troubleshooting

If you encounter issues:

1. **Dual-type toggle not appearing**: Check that `dual-type.js` is correctly included in your HTML.

2. **Mask not applying**: Ensure `mask.png` exists in your `img` folder and has the correct format (white/black areas).

3. **Secondary type not showing**: Check that the script can find your type background images. Verify the paths in the script match your actual image locations.

4. **Console errors**: Open your browser's developer console to check for any error messages that might help identify the issue.

## Advanced Usage

### Custom Masks

Users can create and use custom masks by dragging/dropping them onto the mask drop zone. The mask should be a PNG image with:

- White areas: Show the primary type
- Black areas: Show the secondary type
- Gray areas: Create a blend between types

### Custom Type Backgrounds

Users can also drop custom type background images for either the primary or secondary type, allowing for completely custom card designs.

## Conclusion

This implementation adds dual-type functionality to your Pokemon Card Maker without modifying your original code. It creates a clean separation between the core functionality and the dual-type feature, making it easier to maintain and debug.