import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import RequestForm from './RequestForm';

const HeroThreeJS = () => {
  const [showForm, setShowForm] = useState(false);
  const heroRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const spheresRef = useRef([]);
  const animationFrameRef = useRef(null);
  const vortexRef = useRef(null);

  useEffect(() => {
    // Initialize Three.js scene
    const initThreeJS = () => {
      if (!heroRef.current) return;
      
      const heroSection = heroRef.current.parentElement;
      const width = heroSection.offsetWidth;
      const height = heroSection.offsetHeight;
      
      // Create scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      // Create camera - use orthographic for a flatter look
      const camera = new THREE.OrthographicCamera(
        width / -2, width / 2, 
        height / 2, height / -2, 
        1, 1000
      );
      camera.position.z = 500;
      cameraRef.current = camera;
      
      // Create renderer with better shadows
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setClearColor(0xffffff, 0);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      heroRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      
      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight.position.set(1, 1, 1);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      
      const pointLight1 = new THREE.PointLight(0xffffff, 0.8, 1000);
      pointLight1.position.set(100, 100, 200);
      scene.add(pointLight1);
      
      const pointLight2 = new THREE.PointLight(0x88ccff, 0.5, 1000);
      pointLight2.position.set(-100, 50, 150);
      scene.add(pointLight2);
      
      // Create vortex outline and spheres
      createVortexOutline(width, height);
      createSpheres(width, height);
      
      // Start animation loop
      animate();
    };
    
    // Create vortex outline for the funnel
    const createVortexOutline = (width, height) => {
      const scene = sceneRef.current;
      
      // Target area (right side of screen, 20% of height)
      const targetX = width / 2 + 50; // Right edge plus a bit more
      const targetHeightRange = height * 0.2; // 20% of the height for the funnel target
      const targetYCenter = 0; // Center in Three.js coordinates
      
      // Starting area (left side of screen, 80% of height)
      const startX = -width / 2 - 50; // Left edge minus a bit more
      const startHeightRange = height * 0.8; // 80% of the height for the starting area
      const startYCenter = 0; // Center in Three.js coordinates
      
      // Create vortex frame
      const vortexGroup = new THREE.Group();
      scene.add(vortexGroup);
      vortexRef.current = vortexGroup;
      
      // Create spiral lines for the vortex - more curvy
      const spiralCount = 16; // More spiral lines
      const spiralSegments = 150; // More segments for smoother curves
      
      for (let i = 0; i < spiralCount; i++) {
        const angle = (i / spiralCount) * Math.PI * 2;
        const yOffset = Math.sin(angle) * startHeightRange / 2;
        const zOffset = Math.cos(angle) * 40; // More Z-depth variation
        
        // Create points for the spiral with more curves
        const points = [];
        for (let j = 0; j <= spiralSegments; j++) {
          const progress = j / spiralSegments;
          
          // Calculate position with more curvy spiral effect
          const x = startX + (targetX - startX) * progress;
          
          // Add more curves to the path
          const curveFactor = Math.sin(progress * Math.PI * 4) * 20 * (1 - progress);
          
          // Calculate y with funnel effect (wide to narrow) and more curves
          const startY = startYCenter + yOffset * (1 - progress);
          const targetY = targetYCenter + (Math.sin(angle + progress * 8) * targetHeightRange / 2) * progress;
          const y = startY * (1 - progress) + targetY * progress + curveFactor * Math.sin(angle);
          
          // Calculate z with more pronounced spiral effect
          const z = zOffset * Math.sin(progress * Math.PI * 5) * (1 - progress * 0.7);
          
          points.push(new THREE.Vector3(x, y, z));
        }
        
        // Create geometry from points
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Create material with glow effect - more vibrant
        const material = new THREE.LineBasicMaterial({
          color: 0x3b3992,
          transparent: true,
          opacity: 0.3 + (i % 4) * 0.1,
          linewidth: 1
        });
        
        // Create line
        const line = new THREE.Line(geometry, material);
        vortexGroup.add(line);
      }
      
      // Add horizontal rings at intervals along the funnel
      const ringCount = 12; // More rings to compensate for removed vertical lines
      for (let i = 0; i < ringCount; i++) {
        const progress = i / (ringCount - 1);
        const x = startX + (targetX - startX) * progress;
        
        // Ring size decreases along the funnel with a slight curve
        const ringSize = startHeightRange * (1 - progress) + targetHeightRange * progress;
        
        // Create ring
        const ringGeometry = new THREE.RingGeometry(
          ringSize * 0.48, // Inner radius
          ringSize * 0.5,  // Outer radius
          32,              // Segments
          1                // Theta segments
        );
        
        // Rotate ring to face the camera
        ringGeometry.rotateY(Math.PI / 2);
        
        // Position ring
        ringGeometry.translate(x, 0, 0);
        
        // Create material with glow effect
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0x3b3992,
          transparent: true,
          opacity: 0.2 + progress * 0.4,
          side: THREE.DoubleSide
        });
        
        // Create mesh
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        vortexGroup.add(ring);
      }
      
      // Add entrance and exit portals
      // Entrance portal (left side)
      const entranceGeometry = new THREE.RingGeometry(
        startHeightRange * 0.48, // Inner radius
        startHeightRange * 0.5,  // Outer radius
        32,                      // Segments
        1                        // Theta segments
      );
      entranceGeometry.rotateY(Math.PI / 2);
      entranceGeometry.translate(startX, 0, 0);
      
      const entranceMaterial = new THREE.MeshBasicMaterial({
        color: 0x3b3992,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      
      const entrancePortal = new THREE.Mesh(entranceGeometry, entranceMaterial);
      vortexGroup.add(entrancePortal);
      
      // Exit portal (right side)
      const exitGeometry = new THREE.RingGeometry(
        targetHeightRange * 0.48, // Inner radius
        targetHeightRange * 0.5,  // Outer radius
        32,                       // Segments
        1                         // Theta segments
      );
      exitGeometry.rotateY(Math.PI / 2);
      exitGeometry.translate(targetX, 0, 0);
      
      const exitMaterial = new THREE.MeshBasicMaterial({
        color: 0x3b3992,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      
      const exitPortal = new THREE.Mesh(exitGeometry, exitMaterial);
      vortexGroup.add(exitPortal);
      
      // Add inner glow to entrance and exit
      const entranceGlowGeometry = new THREE.RingGeometry(
        startHeightRange * 0.3, // Inner radius
        startHeightRange * 0.47, // Outer radius
        32,                     // Segments
        1                       // Theta segments
      );
      entranceGlowGeometry.rotateY(Math.PI / 2);
      entranceGlowGeometry.translate(startX, 0, 0);
      
      const entranceGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x3b3992,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      
      const entranceGlow = new THREE.Mesh(entranceGlowGeometry, entranceGlowMaterial);
      vortexGroup.add(entranceGlow);
      
      const exitGlowGeometry = new THREE.RingGeometry(
        targetHeightRange * 0.3, // Inner radius
        targetHeightRange * 0.47, // Outer radius
        32,                      // Segments
        1                        // Theta segments
      );
      exitGlowGeometry.rotateY(Math.PI / 2);
      exitGlowGeometry.translate(targetX, 0, 0);
      
      const exitGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0x3b3992,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      
      const exitGlow = new THREE.Mesh(exitGlowGeometry, exitGlowMaterial);
      vortexGroup.add(exitGlow);
    };
    
    // Create and animate spheres
    const createSpheres = (width, height) => {
      const scene = sceneRef.current;
      const dealCount = 6; // Reduced from 8 to 6 (80% of current)
      
      // Target area (right side of screen, 20% of height)
      const targetX = width / 2 + 50;
      const targetHeightRange = height * 0.2;
      const targetYCenter = 0;
      
      // Create initial spheres
      for (let i = 0; i < dealCount; i++) {
        const initialProgress = i / dealCount;
        createSphere(width, height, targetX, targetYCenter, targetHeightRange, initialProgress);
      }
      
      // Add new spheres less frequently
      const intervalId = setInterval(() => {
        createSphere(width, height, targetX, targetYCenter, targetHeightRange, 0);
      }, 1500); // Increased from 1200 to 1500ms to maintain relative density
      
      return intervalId;
    };
    
    // Create a single sphere with path
    const createSphere = (width, height, targetX, targetYCenter, targetHeightRange, initialProgress = 0) => {
      const scene = sceneRef.current;
      
      // Create sphere geometry with fixed size
      const size = 6;
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      
      // Simplified material with fewer properties
      const material = new THREE.MeshStandardMaterial({
        color: 0x3b3992,
        metalness: 0.9,
        roughness: 0.3,
        emissive: 0x3b3992,
        emissiveIntensity: 0.02
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      scene.add(sphere);
      
      // Simplified border
      const borderGeometry = new THREE.SphereGeometry(size * 1.02, 32, 32);
      const borderMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        transparent: true,
        opacity: 0.3,
        wireframe: true
      });
      const border = new THREE.Mesh(borderGeometry, borderMaterial);
      sphere.add(border);
      
      // Starting position
      const startX = -width / 2 - 50;
      const startHeightRange = height * 0.8;
      const entranceRadius = startHeightRange * 0.48;
      
      // Calculate starting position within entrance portal
      const angle = Math.random() * Math.PI * 2;
      const distanceFromCenter = Math.random() * entranceRadius * 0.7;
      
      const startY = Math.sin(angle) * distanceFromCenter;
      const startZ = Math.cos(angle) * distanceFromCenter * 0.5;
      
      // Calculate target position
      const exitRadius = targetHeightRange * 0.48;
      const targetAngle = angle + (Math.random() * 0.2 - 0.1) * Math.PI;
      const targetDistanceFromCenter = Math.random() * exitRadius * 0.6;
      
      const targetY = Math.sin(targetAngle) * targetDistanceFromCenter;
      const targetZ = Math.cos(targetAngle) * targetDistanceFromCenter * 0.5;
      
      // Animation properties
      const duration = 15;
      const startTime = Date.now() - (initialProgress * duration * 1000);
      
      const rotationSpeed = {
        x: (Math.random() - 0.5) * 0.8,
        y: (Math.random() - 0.5) * 0.8,
        z: (Math.random() - 0.5) * 0.3
      };
      
      // Store sphere data
      spheresRef.current.push({
        sphere,
        startX,
        startY,
        startZ,
        targetX,
        targetY,
        targetZ,
        startTime,
        duration,
        rotationSpeed,
        willExplode: Math.random() < 0.2,
        explosionPoint: 0.7 + Math.random() * 0.2,
        exploded: false,
        startAngle: angle,
        targetAngle,
        startRadius: distanceFromCenter,
        targetRadius: targetDistanceFromCenter,
        entranceRadius,
        exitRadius
      });
    };
    
    // Create explosion effect
    const createExplosion = (position, size) => {
      const scene = sceneRef.current;
      
      const flashGeometry = new THREE.CircleGeometry(size * 0.8, 32);
      const flashMaterial = new THREE.MeshBasicMaterial({
        color: 0x3b3992,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      
      const flash = new THREE.Mesh(flashGeometry, flashMaterial);
      flash.position.copy(position);
      flash.position.z -= 1;
      flash.lookAt(position.clone().add(new THREE.Vector3(0, 0, 1)));
      scene.add(flash);
      
      let explosionFrame;
      const startTime = Date.now();
      const duration = 1000;
      
      const animateExplosion = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress >= 1) {
          scene.remove(flash);
          flashGeometry.dispose();
          flashMaterial.dispose();
          cancelAnimationFrame(explosionFrame);
          return;
        }
        
        const flashScale = size * (0.8 + progress * 2.5);
        flash.scale.set(flashScale, flashScale, 1);
        
        const fadeProgress = Math.pow(1 - progress, 3);
        flashMaterial.opacity = 0.85 * fadeProgress;
        
        explosionFrame = requestAnimationFrame(animateExplosion);
      };
      
      explosionFrame = requestAnimationFrame(animateExplosion);
    };
    
    // Animation loop
    const animate = () => {
      if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;
      
      const now = Date.now();
      
      // Animate vortex
      if (vortexRef.current) {
        vortexRef.current.rotation.z = Math.sin(now * 0.0005) * 0.08;
        vortexRef.current.rotation.x = Math.sin(now * 0.0003) * 0.03;
        
        vortexRef.current.children.forEach((child, index) => {
          if (child.material) {
            const pulseSpeed = 0.0008 + (index % 5) * 0.0001;
            const pulsePhase = index * 0.2;
            const basePulse = Math.sin(now * pulseSpeed + pulsePhase) * 0.3 + 0.7;
            
            if (child.geometry.type === 'RingGeometry') {
              child.material.opacity = child.material.opacity * 0.95 + (basePulse * 0.4) * 0.05;
              
              if (index % 3 === 0) {
                const scalePulse = 1 + Math.sin(now * 0.001 + index) * 0.03;
                child.scale.set(scalePulse, scalePulse, 1);
              }
            } else if (child.geometry.type === 'BufferGeometry') {
              child.material.opacity = child.material.opacity * 0.98 + (basePulse * 0.2 + 0.2) * 0.02;
              
              if (child.material.color && index % 4 === 0) {
                const hue = 0.6 + Math.sin(now * 0.0005 + index * 0.1) * 0.05;
                child.material.color.setHSL(hue, 0.8, 0.5);
              }
            }
            
            if (index % 7 === 0 && child.position) {
              child.position.z = Math.sin(now * 0.001 + index) * 5;
            }
          }
        });
      }
      
      // Update spheres
      for (let i = spheresRef.current.length - 1; i >= 0; i--) {
        const sphereData = spheresRef.current[i];
        const {
          sphere,
          startX,
          startY,
          startZ,
          targetX,
          targetY,
          targetZ,
          startTime,
          duration,
          rotationSpeed,
          willExplode,
          explosionPoint,
          startAngle,
          targetAngle,
          startRadius,
          targetRadius,
          entranceRadius,
          exitRadius
        } = sphereData;
        
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / (duration * 1000));
        
        // Handle explosion
        if (willExplode && !sphereData.exploded && progress > explosionPoint) {
          sphereData.exploded = true;
          createExplosion(sphere.position, sphere.geometry.parameters.radius);
          
          // Cleanup
          sceneRef.current.remove(sphere);
          sphere.geometry.dispose();
          sphere.material.dispose();
          spheresRef.current.splice(i, 1);
          continue;
        }
        
        // Remove completed spheres
        if (progress >= 1 && !sphereData.exploded) {
          sceneRef.current.remove(sphere);
          sphere.geometry.dispose();
          sphere.material.dispose();
          spheresRef.current.splice(i, 1);
          continue;
        }
        
        // Update position
        const easeProgress = easeInOutCubic(progress);
        sphere.position.x = startX + (targetX - startX) * progress;
        
        const startHeightFactor = 1 - easeProgress;
        const targetHeightFactor = easeProgress;
        const funnelRadius = (entranceRadius * startHeightFactor + exitRadius * targetHeightFactor) * 0.95;
        
        const spiralFactor = 0.5;
        const currentAngle = startAngle * startHeightFactor + 
                            targetAngle * targetHeightFactor + 
                            progress * Math.PI * spiralFactor;
        
        const currentDistanceFromCenter = (startRadius * startHeightFactor + targetRadius * targetHeightFactor);
        const clampedDistance = Math.min(currentDistanceFromCenter, funnelRadius * 0.8);
        
        sphere.position.y = Math.sin(currentAngle) * clampedDistance;
        sphere.position.z = Math.cos(currentAngle) * clampedDistance * 0.5;
        
        // Update rotation
        sphere.rotation.x += rotationSpeed.x * 0.02;
        sphere.rotation.y += rotationSpeed.y * 0.02;
        sphere.rotation.z += rotationSpeed.z * 0.02;
      }
      
      // Render scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    // Easing function
    const easeInOutCubic = (t) => {
      return t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    // Handle window resize
    const handleResize = () => {
      if (!heroRef.current || !rendererRef.current || !cameraRef.current) return;
      
      const heroSection = heroRef.current.parentElement;
      const width = heroSection.offsetWidth;
      const height = heroSection.offsetHeight;
      
      cameraRef.current.left = width / -2;
      cameraRef.current.right = width / 2;
      cameraRef.current.top = height / 2;
      cameraRef.current.bottom = height / -2;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    // Initialize and cleanup
    initThreeJS();
    const intervalId = createSpheres(
      heroRef.current.parentElement.offsetWidth,
      heroRef.current.parentElement.offsetHeight
    );
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(intervalId);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (heroRef.current) {
          heroRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      
      spheresRef.current.forEach(({ sphere }) => {
        sphere.geometry.dispose();
        sphere.material.dispose();
      });
      
      if (vortexRef.current) {
        vortexRef.current.children.forEach(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-16 pb-32 overflow-hidden">
      <div className="hero-background" id="hero-animation" ref={heroRef}></div>
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-6">
            AI-Powered Deal Sourcing for Private Equity
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Streamline your investment thesis, identify ideal targets, and accelerate your deal pipeline with our specialized AI platform for the German market.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <button 
              onClick={() => setShowForm(true)}
              className="bg-[#3b3992] hover:bg-[#3b3992]/80 text-white px-8 py-4 rounded-md font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <span>Request a Demo</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="border-2 border-[#3b3992] text-[#3b3992] px-8 py-4 rounded-md font-medium hover:bg-[#3b3992] hover:text-white transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal for Request Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <RequestForm />
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroThreeJS; 