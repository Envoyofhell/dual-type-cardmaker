// background.js - Three.js Particle Background Script
// This script functions as a static background animation with mouse/touch interaction.

(function() {
    'use strict';

    // --- Check for Three.js Library ---
    // Ensure the Three.js library is loaded before attempting to initialize the background.
    try {
        if (typeof THREE === 'undefined') {
            console.error("Three.js library not loaded. Background cannot be initialized.");
            return; // Stop execution if Three.js is not available.
        }
    } catch (e) {
        console.error("Error checking for Three.js:", e);
        return;
    }

    // --- Variable Declarations ---
    let scene, camera, renderer;
    let container; // The HTML element that will contain the Three.js canvas.
    let HEIGHT, WIDTH; // Dimensions of the container.
    let fieldOfView, aspectRatio, nearPlane, farPlane; // Camera parameters.
    let geometry, particleCount;
    let materials = []; // Array to hold different particle materials.
    let mouseX = 0, mouseY = 0; // Mouse/touch coordinates for camera interaction.
    let windowHalfX, windowHalfY; // Half dimensions for mouse position calculation.
    let cameraZ; // Initial Z position of the camera.
    let fogHex, fogDensity; // Fog parameters.
    let parameters = {}; // Holds particle parameters (only normal state now).
    let parameterCount; // Number of different particle types.
    let particles; // THREE.Points object (or group of objects).
    let rafId = null; // RequestAnimationFrame ID for animation loop control.

    // --- Configuration Constants ---
    const BACKGROUND_COLOR = 0x0a0514; // Dark background color.
    const FOG_COLOR = 0x0a0514; // Fog color (matches background for seamless transition).
    const FOG_DENSITY = 0.001; // Density of the fog.
    const PARTICLE_COUNT = 10000; // Total number of particles.

    // Parameters for NORMAL state: [ [H (0-1), S (0-1), L (0-1)], BaseSize ]
    const PARTICLE_PARAMS_NORMAL = [
        [[0.95, 0.7, 0.25], 3], // Example: Reddish, high sat, low light
        [[0.80, 0.7, 0.22], 2.5], // Example: Purplish, high sat, low light
        [[0.0, 0.7, 0.22], 2.5], // Example: Red, high sat, low light
        [[0.85, 0.6, 0.20], 2], // Example: Bluish-purple, medium sat, low light
        [[0.98, 0.6, 0.20], 2]  // Example: Pinkish, medium sat, low light
    ];

    const CAMERA_Z = 1000; // Initial camera distance.
    const ROTATION_SPEED_NORMAL = 0.000015; // Speed of particle rotation in normal state.
    const BREATHING_INTENSITY = 25; // How much the camera moves in/out.
    const BREATHING_SPEED = 0.0001; // Speed of the camera 'breathing' movement.
    const MOUSE_FOLLOW_SPEED = 0.02; // How quickly the camera follows the mouse.

    /**
     * Initializes the Three.js environment, sets up the scene, camera, renderer,
     * creates particles, and adds event listeners.
     */
    function initThreeJS() {
        // Get the container element for the Three.js canvas.
        container = document.getElementById('threejs-bg');
        if (!container) {
            console.error("Three.js container #threejs-bg not found.");
            return; // Stop initialization if the container is missing.
        }

        // Setup dimensions and camera parameters
        HEIGHT = window.innerHeight;
        WIDTH = window.innerWidth;
        windowHalfX = WIDTH / 2;
        windowHalfY = HEIGHT / 2;
        fieldOfView = 75;
        aspectRatio = WIDTH / HEIGHT;
        nearPlane = 1;
        farPlane = 3000;
        cameraZ = CAMERA_Z;
        fogHex = FOG_COLOR;
        fogDensity = FOG_DENSITY;

        // Create camera
        camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
        camera.position.z = cameraZ;

        // Create scene and add fog
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(fogHex, fogDensity);

        // Create particle geometry (positions of each particle)
        geometry = new THREE.BufferGeometry();
        const positions = [];
        particleCount = PARTICLE_COUNT;
        for (let i = 0; i < particleCount; i++) {
            // Distribute particles randomly in a cube
            const x = Math.random() * 2000 - 1000;
            const y = Math.random() * 2000 - 1000;
            const z = Math.random() * 2000 - 1000;
            positions.push(x, y, z);
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        // Create materials and points objects based on normal state parameters
        parameters = PARTICLE_PARAMS_NORMAL; // Use normal state parameters
        parameterCount = parameters.length;
        materials = [];
        for (let i = 0; i < parameterCount; i++) {
            const size = parameters[i][1]; // Get base size from parameters
            materials[i] = new THREE.PointsMaterial({
                size: size,
                vertexColors: false, // We'll set color per material, not per vertex
                blending: THREE.NormalBlending,
                transparent: true,
                opacity: 0.7 // Initial opacity
            });
             // Set initial color for the material based on normal parameters
            const baseH = parameters[i][0][0];
            const baseS = parameters[i][0][1];
            const baseL = parameters[i][0][2];
            materials[i].color.setHSL(baseH, baseS, baseL);

            // Create a Points object for each material and add to the scene
            particles = new THREE.Points(geometry, materials[i]);
            // Give each particle system a random initial rotation
            particles.rotation.x = Math.random() * 6;
            particles.rotation.y = Math.random() * 6;
            particles.rotation.z = Math.random() * 6;
            scene.add(particles);
        }

        // Initialize renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: true allows transparency if needed
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(WIDTH, HEIGHT);
        renderer.setClearColor(BACKGROUND_COLOR, 1); // Set background color
        container.appendChild(renderer.domElement); // Add the renderer's canvas to the container

        // --- Event Listeners ---
        // Handle window resizing to keep the background full screen.
        window.addEventListener('resize', onWindowResize, false);
        // Handle mouse movement for camera interaction.
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        // Handle touch events for camera interaction on touch devices.
        document.addEventListener('touchstart', onDocumentTouchStart, { passive: false });
        document.addEventListener('touchmove', onDocumentTouchMove, { passive: false });

        // Start animation loop
        animate();
        console.log("Three.js normal background initialized.");
    }

    /** Animation loop ticker. */
    function animate() {
        rafId = requestAnimationFrame(animate);
        renderThreeJS();
    }

    /** Renders a single frame. */
    function renderThreeJS() {
        const time = Date.now() * ROTATION_SPEED_NORMAL; // Time for rotation (using normal speed)

        // --- Animate camera ---
        // Camera breathing movement
        camera.position.z = cameraZ + Math.sin(Date.now() * BREATHING_SPEED) * BREATHING_INTENSITY;
        // Camera follow mouse movement
        camera.position.x += (mouseX - camera.position.x) * MOUSE_FOLLOW_SPEED;
        camera.position.y += (-mouseY - camera.position.y) * MOUSE_FOLLOW_SPEED;
        camera.lookAt(scene.position); // Always look at the center of the scene

        // --- Animate particle systems rotation ---
        parameterCount = parameters.length; // Ensure parameterCount is correct
        for (let i = 0; i < scene.children.length; i++) {
            const object = scene.children[i];
            // Rotate only the Points objects
            if (object instanceof THREE.Points) {
                 // Apply rotation based on time and particle system index
                object.rotation.y = time * (i < (parameterCount / 2) ? i + 1 : -(i + 1));
            }
        }

        // --- Animate materials (Color, Opacity, Size) ---
        // In the normal state, colors and sizes are static, set during initialization.
        // If you wanted subtle animation (like pulsating opacity), you would add it here.
        // For this simplified version, no material animation is needed in render.

        // Render the scene
        if (renderer) { renderer.render(scene, camera); }
    }

    // --- Event Handlers ---
    /** Handles mouse movement to update mouseX and mouseY. */
    function onDocumentMouseMove(e) {
        mouseX = e.clientX - windowHalfX;
        mouseY = e.clientY - windowHalfY;
    }

    /** Handles touch start events to update mouseX and mouseY. */
    function onDocumentTouchStart(e) {
        if (e.touches.length === 1) {
            // Prevent default touch behavior if touching the background container or renderer element
            if (e.target === container || (renderer && e.target === renderer.domElement)) {
                 e.preventDefault();
            }
            mouseX = e.touches[0].pageX - windowHalfX;
            mouseY = e.touches[0].pageY - windowHalfY;
        }
    }

    /** Handles touch move events to update mouseX and mouseY. */
    function onDocumentTouchMove(e) {
        if (e.touches.length === 1) {
            // Prevent default touch behavior if touching the background container or renderer element
             if (e.target === container || (renderer && e.target === renderer.domElement)) {
                 e.preventDefault();
            }
            mouseX = e.touches[0].pageX - windowHalfX;
            mouseY = e.touches[0].pageY - windowHalfY;
        }
    }

    /** Handles window resize events to update camera aspect ratio and renderer size. */
    function onWindowResize() {
        try {
            WIDTH = window.innerWidth;
            HEIGHT = window.innerHeight;
            windowHalfX = WIDTH / 2;
            windowHalfY = HEIGHT / 2;
            if(camera){
                camera.aspect = WIDTH / HEIGHT;
                camera.updateProjectionMatrix();
            }
            if (renderer) {
                renderer.setSize(WIDTH, HEIGHT);
            }
        } catch(e) {
            console.error("Error on window resize:", e);
        }
    }

    // --- Initialize ---
    // Initialize Three.js once the DOM is fully loaded.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThreeJS);
    } else {
        initThreeJS();
    }

    // --- Cleanup ---
    // Clean up event listeners and animation frame on page unload.
    window.addEventListener('unload', () => {
        if (rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('resize', onWindowResize);
        document.removeEventListener('mousemove', onDocumentMouseMove);
        document.removeEventListener('touchstart', onDocumentTouchStart);
        document.removeEventListener('touchmove', onDocumentTouchMove);
        // Note: We didn't add a custom event listener in this simplified version,
        // so no need to remove one here.
        console.log("Three.js background cleaned up.");
    });

    // Catch top-level errors during script execution
    } catch (e) {
        console.error("Error in Three.js background script:", e);
        // Fallback: Set a simple background color if Three.js fails to initialize
        const bgContainer = document.getElementById('threejs-bg');
        if (bgContainer) bgContainer.style.background = '#111';
    }
})(); // End of IIFE (Immediately Invoked Function Expression)
