# Enhanced Dual Type System - Implementation Guide

This guide explains how to integrate the enhanced dual type system into the Pokémon Card Maker application. The enhancements provide better masking, blending, and visual control for dual type cards.

## Features

- **Multiple mask options**: Choose from various mask patterns beyond the default diagonal split
- **CSS mix-blend-mode support**: Control how the second type layer blends with the primary type
- **Improved UI**: Clearer dropdowns with improved readability
- **Visual previews**: See how different masks and blend modes affect your card
- **Built-in mask generator**: Default masks are created dynamically if not available
- **Better card downloads**: Consistent masking and blending in both preview and downloads
- **Custom mask support**: Automatically detects and uses PNG masks from the img/masks directory

## Implementation Steps

Follow these steps to implement the enhanced dual type system:

### 1. Add JavaScript Files

First, create a new file called `enhanced-dual-type-system.js` in your project's JavaScript directory. Copy the complete implementation code into this file. This script contains all the functionality needed for the enhanced dual type system.

### 2. Add to HTML

Add a reference to the script in your HTML file, after the existing dual type scripts:

```html
<!-- Add this after the other dual type scripts -->
<script src="js/enhanced-dual-type-system.js" defer></script>
```

Place this script tag after these existing scripts:
- `js/dual-type-simple.js`
- `js/dual-set-selector.js`
- `js/mask-manager.js`
- `js/card-download.js`

This ensures that the enhanced system can properly integrate with the existing code.

### 3. What About Existing Files?

**Your existing files are still needed!** The enhanced system works as an overlay that improves the functionality of your current files rather than replacing them:

- **dual-type-simple.js**: Still handles the basic dual type functionality
- **mask-manager.js**: Provides the base mask selection logic
- **dual-set-selector.js**: Controls the card set selection
- **card-download.js**: Handles the card downloading process

The enhanced system integrates with these files, extending their functionality while maintaining compatibility with your existing codebase.

### 4. Custom Mask Support

Yes, the enhanced system will automatically detect and use any PNG mask files you place in the `img/masks/` directory! Here's how it works:

1. **Built-in Masks**: The system generates several default masks automatically using SVG data URLs
2. **Custom PNG Masks**: The system detects any mask PNG files loaded from the `img/masks/` directory
3. **Automatic Detection**: When a PNG file is loaded from this directory, it's automatically added to the mask dropdown
4. **Visual Previews**: Custom masks also get preview items added to the visual preview grid

For best results with custom masks:
- Use PNG files with transparency
- Black areas will show the second type
- Transparent areas will show the primary type
- Gray/semi-transparent areas create gradient blends
- Place files in the `img/masks/` directory

### 5. Create Mask Directory

Create a directory called `masks` inside your `img` directory:

```
img/
  └── masks/
```

Add your custom mask PNG files to this directory. The system will automatically detect and use them.

### 6. Testing

After implementing these changes, test the dual type functionality:

1. Enable the dual type toggle
2. Select a second type
3. Try different mask options from the dropdown
4. Try different blend modes from the dropdown
5. Verify that any custom PNG masks are detected and available
6. Verify that the preview updates correctly
7. Download the card and verify that the mask and blend mode are applied correctly

## How Masking Works

The enhanced system uses two complementary techniques to create the masking effect:

1. **CSS Mask/Clip-Path**: Controls which parts of the second type are visible
   - Black areas of the mask show the second type
   - Transparent areas hide the second type (showing the primary type)
   - Gray/semi-transparent areas create partial visibility

2. **CSS Mix-Blend-Mode**: Controls how the visible parts of the second type blend with the primary type
   - Different blend modes create different visual effects
   - For example, 'multiply' darkens where types overlap, 'screen' lightens, etc.

This combination gives you much more control over the visual appearance of dual type cards.

## Customization

### Adding Custom Masks

To add your own custom masks:

1. Create a black and white PNG image where:
   - **Black areas** show the second type layer
   - **White/transparent areas** show the primary type layer
   - **Gray areas** create a gradient blend between types
   
2. Save the image to the `img/masks/` directory with a descriptive name (e.g., `diagonal-fade.png`)

3. The system will automatically detect the mask when it's loaded and add it to the dropdown and preview grid

You can also programmatically add custom masks using the exposed API:

```javascript
// Add a custom mask
window.enhancedDualType.addCustomMask('img/masks/my-custom-mask.png', 'My Custom Mask');
```

### Using the API

The enhanced system exposes a global API via `window.enhancedDualType` with these methods:

```javascript
// Apply the current mask and blend
window.enhancedDualType.applyCurrentMaskAndBlend();

// Get/set the current mask URL
const maskUrl = window.enhancedDualType.getCurrentMaskUrl();
window.enhancedDualType.setMaskUrl('img/masks/my-mask.png');

// Get/set the current blend mode
const blendMode = window.enhancedDualType.getCurrentBlendMode();
window.enhancedDualType.setBlendMode('multiply');

// Add a custom mask
window.enhancedDualType.addCustomMask('img/masks/custom.png', 'Custom Mask');
```

## Troubleshooting

### Mask Not Applying

If masks aren't applying correctly:

1. Check browser console for errors
2. Verify that the mask paths are correct (should be `img/masks/filename.png`)
3. Try using the built-in masks first before custom masks
4. Check that the second layer is being created (`#second-card-layer` should exist in the DOM)
5. Use browser dev tools to inspect the applied CSS properties on the second layer

### Custom Masks Not Showing

If your custom masks aren't showing up:

1. Make sure they're in the correct directory (`img/masks/`)
2. Check file permissions and CORS settings if serving from a web server
3. Try manually adding them using the API: `window.enhancedDualType.addCustomMask()`
4. Check browser console for any errors when loading the images

### Download Issues

If downloaded cards don't match the preview:

1. Make sure the card-download.js integration is working
2. Try using a different mask or blend mode to see if the issue is specific to certain options
3. Check if the browser supports the CSS properties being used (mask-image, mix-blend-mode)
4. Try increasing the delay in the `enhanceCardDownload` function (currently 100ms)

## Browser Compatibility

The enhanced system uses modern CSS features that may not be supported in all browsers:

- **mask-image**: Supported in modern browsers, but may need the `-webkit-` prefix
- **mix-blend-mode**: Good support in modern browsers, but not in some older versions
- **clip-path**: Well-supported in modern browsers

For best results, use the latest versions of Chrome, Firefox, Safari, or Edge.

## Complete Integration Example

Here's how your HTML structure should look after implementation:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Existing styles -->
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/dual-type-simple.css">
    <link rel="stylesheet" href="css/set-selector.css">
    
    <!-- Optional: Enhanced dual type styles -->
    <link rel="stylesheet" href="css/dual-type-enhanced.css">
    
    <!-- Existing scripts -->
    <script src="js/sets.js"></script>
    <script src="js/cardsets.js"></script>
    <script src="js/card-utils.js"></script>
    <script src="js/index.js" defer></script>
    <script src="js/dual-type-simple.js" defer></script>
    <script src="js/dual-set-selector.js" defer></script>
    <script src="js/mask-manager.js" defer></script>
    <script src="js/card-download.js" defer></script>
    
    <!-- Enhanced dual type system -->
    <script src="js/enhanced-dual-type-system.js" defer></script>
</head>
<body>
    <!-- Your existing content -->
    <div id="dual-type-container">
        <div class="type-toggle">
            <label for="dual-type-toggle">Dual Type:</label>
            <input type="checkbox" id="dual-type-toggle" name="dual-type-toggle">
        </div>
        <div id="second-type-selector" class="hidden">
            <p>Second Type:</p>
            <ul id="second-type-list">
                <!-- Type buttons -->
            </ul>
        </div>
        
        <!-- Mask selector (will be enhanced) -->
        <div class="mask-selection-container">
            <label for="mask-selector">Type Mask:</label>
            <select id="mask-selector" name="mask-selector"></select>
        </div>
        
        <!-- Blend mode selector and previews will be added automatically -->
    </div>
    
    <!-- Rest of your content -->
</body>
</html>
```

## Final Notes

The enhanced dual type system is designed to work alongside your existing code, not replace it. It enhances the functionality while maintaining compatibility with your current implementation.

The system automatically detects and uses any PNG mask files you place in the `img/masks/` directory, making it easy to add custom masks without modifying code. It also provides a much more visually appealing way to create dual type cards through the combination of masks and blend modes.

Feel free to experiment with different mask patterns and blend modes to create unique and visually striking dual type cards!
# Enhanced Dual Type System - Implementation Guide

This guide explains how to integrate the enhanced dual type system into the Pokémon Card Maker application. The enhancements provide better masking, blending, and visual control for dual type cards.

## Features

- **Multiple mask options**: Choose from various mask patterns beyond the default diagonal split
- **CSS mix-blend-mode support**: Control how the second type layer blends with the primary type
- **Improved UI**: Clearer dropdowns with improved readability
- **Visual previews**: See how different masks and blend modes affect your card
- **Built-in mask generator**: Default masks are created dynamically if not available
- **Better card downloads**: Consistent masking and blending in both preview and downloads

## Implementation Steps

Follow these steps to implement the enhanced dual type system:

### 1. Add JavaScript Files

First, create a new file called `enhanced-dual-type-system.js` in your project's JavaScript directory. Copy the complete implementation code into this file. This script contains all the functionality needed for the enhanced dual type system.

### 2. Add to HTML

Add a reference to the script in your HTML file, after the existing dual type scripts:

```html
<!-- Add this after the other dual type scripts -->
<script src="js/enhanced-dual-type-system.js" defer></script>
```

Place this script tag after these existing scripts:
- `js/dual-type-simple.js`
- `js/dual-set-selector.js`
- `js/mask-manager.js`
- `js/card-download.js`

This ensures that the enhanced system can properly integrate with the existing code.

### 3. Update Mask Selector

If your HTML already has a mask selector dropdown, ensure it has the following format:

```html
<div class="mask-selection-container">
    <label for="mask-selector">Type Mask:</label>
    <select id="mask-selector" name="mask-selector">
        <option value="">Default Split (Diagonal)</option>
        <option value="img/mask.png">Standard Mask</option>
    </select>
</div>
```

The enhanced system will automatically populate this dropdown with additional options and add the blend mode selector next to it.

### 4. Create Mask Directory

Create a directory called `masks` inside your `img` directory:

```
img/
  └── masks/
```

The script will automatically create mask files using SVG data URLs, but you can also add your own custom mask images to this directory.

### 5. Testing

After implementing these changes, test the dual type functionality:

1. Enable the dual type toggle
2. Select a second type
3. Try different mask options from the dropdown
4. Try different blend modes from the dropdown
5. Verify that the preview updates correctly
6. Download the card and verify that the mask and blend mode are applied correctly

## Customization

### Adding Custom Masks

To add your own custom masks:

1. Create a black and white PNG or SVG image where:
   - **Black areas** show the second type layer
   - **White/transparent areas** show the primary type layer
   - **Gray areas** create a gradient blend between types
   
2. Save the image to the `img/masks/` directory with a descriptive name

3. Add a new option to the mask selector dropdown in the HTML:

```html
<option value="img/masks/your-custom-mask.png">Your Custom Mask</option>
```

### Modifying the CSS

The enhanced system injects its own CSS for the dual type UI. If you want to customize this styling, you can modify the CSS in the `injectCSS` function within the `enhanced-dual-type-system.js` file.

## Troubleshooting

### Mask Not Applying

If masks aren't applying correctly:

1. Check browser console for errors
2. Verify that the mask paths are correct
3. Try using the built-in masks first before custom masks
4. Check that the second layer is being created (`#second-card-layer` should exist in the DOM)

### Download Issues

If downloaded cards don't match the preview:

1. Make sure the card-download.js integration is working
2. Check that the enhancement is properly integrating with the download functionality
3. Try using a different mask or blend mode to see if the issue is specific to certain options

## Complete Integration Example

Here's how your HTML structure should look after implementation:

```html
<div id="dual-type-container">
    <div class="type-toggle">
        <label for="dual-type-toggle">Dual Type:</label>
        <input type="checkbox" id="dual-type-toggle" name="dual-type-toggle">
    </div>
    <div id="second-type-selector" class="hidden">
        <p>Second Type:</p>
        <ul id="second-type-list">
            <!-- Type buttons -->
        </ul>
    </div>
    
    <!-- Mask selector (will be enhanced) -->
    <div class="mask-selection-container">
        <label for="mask-selector">Type Mask:</label>
        <select id="mask-selector" name="mask-selector"></select>
    </div>
    
    <!-- Blend mode selector (will be added automatically) -->
    <!-- Preview sections (will be added automatically) -->
</div>
```

The enhanced system will automatically create all additional UI elements needed for the improved dual type functionality.