// Create dynamic background animation for the hero section
document.addEventListener('DOMContentLoaded', function() {
  const heroAnimation = document.getElementById('hero-animation');
  const heroSection = heroAnimation.parentElement;
  
  // Set explicit dimensions for the hero background
  heroAnimation.style.width = heroSection.offsetWidth + 'px';
  heroAnimation.style.height = heroSection.offsetHeight + 'px';
  
  // Create SVG namespace for path elements
  const svgNS = "http://www.w3.org/2000/svg";
  
  // Function to create and animate particles with exponential curve paths
  const createParticles = () => {
    // Create SVG element to hold all paths
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.overflow = "visible";
    heroAnimation.appendChild(svg);
    
    // Reference values for the funnel
    const centerY = heroSection.offsetHeight / 2;
    const viewportWidth = heroSection.offsetWidth;
    
    // Number of particles
    const particleCount = 20;
    
    // Track active particles for management
    const activeParticles = [];
    
    // Create explosion effect
    const createExplosion = (x, y, size) => {
      const explosion = document.createElement('div');
      explosion.classList.add('particle-explosion');
      explosion.style.left = (x - size/2) + 'px';
      explosion.style.top = (y - size/2) + 'px';
      explosion.style.width = size + 'px';
      explosion.style.height = size + 'px';
      
      // Add to DOM
      heroAnimation.appendChild(explosion);
      
      // Remove after animation completes
      setTimeout(() => {
        explosion.remove();
      }, 600);
    };
    
    // Main particle creation function
    const createParticle = () => {
      // Create particle (the visible dot)
      const particle = document.createElement('div');
      particle.classList.add('pipeline-particle');
      
      // Size between 6px and 12px (vary sizes)
      const size = Math.max(6, Math.floor(8 + (Math.random() * 4)));
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      
      // Create the path element for this particle
      const path = document.createElementNS(svgNS, "path");
      path.classList.add('particle-path');
      path.setAttribute("stroke-width", "2");
      svg.appendChild(path);
      
      // Random parameters for this particle's path
      const startingHeight = Math.random() * 0.8 + 0.1; // 10% to 90% of height
      const startY = heroSection.offsetHeight * startingHeight;
      const exponentialFactor = 3 + Math.random() * 2; // Steepness of exponential curve
      const yFinalDeviation = (startY - centerY) / exponentialFactor; // How close it gets to center
      
      // Generate the exponential curve path
      const generatePathData = () => {
        // Start offscreen to the left
        const startX = -50;
        
        // Generate path points
        let pathData = `M ${startX} ${startY}`;
        
        // Number of points to generate for the curve
        const pointCount = 30;
        const xIncrement = (viewportWidth + 100 - startX) / pointCount;
        
        for (let j = 1; j <= pointCount; j++) {
          const x = startX + (j * xIncrement);
          const xProgress = (x - startX) / (viewportWidth - startX);
          
          // Exponential curve formula: y = y0 + (yTarget - y0) * (1 - e^(-k*x))
          // where k is the exponential factor controlling convergence speed
          const exponentialProgress = 1 - Math.exp(-exponentialFactor * xProgress);
          const y = startY - ((startY - centerY) - yFinalDeviation) * exponentialProgress;
          
          pathData += ` L ${x} ${y}`;
        }
        
        return pathData;
      };
      
      const pathData = generatePathData();
      path.setAttribute("d", pathData);
      
      // Set initial particle position offscreen
      particle.style.left = "-50px";
      particle.style.top = startY + "px";
      
      // Add particle to DOM
      heroAnimation.appendChild(particle);
      
      // Animation duration varies slightly
      const duration = 15 + (Math.random() * 8);
      
      // Create animated gradient for the path
      const gradient = document.createElementNS(svgNS, "linearGradient");
      const gradientId = `gradient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      gradient.setAttribute("id", gradientId);
      gradient.setAttribute("gradientUnits", "userSpaceOnUse");
      
      const stop1 = document.createElementNS(svgNS, "stop");
      stop1.setAttribute("offset", "0%");
      stop1.setAttribute("stop-color", "#666");
      stop1.setAttribute("stop-opacity", "0.8");
      
      const stop2 = document.createElementNS(svgNS, "stop");
      stop2.setAttribute("offset", "30%");
      stop2.setAttribute("stop-color", "#666");
      stop2.setAttribute("stop-opacity", "0.6");
      
      const stop3 = document.createElementNS(svgNS, "stop");
      stop3.setAttribute("offset", "60%");
      stop3.setAttribute("stop-color", "#666");
      stop3.setAttribute("stop-opacity", "0.4");
      
      const stop4 = document.createElementNS(svgNS, "stop");
      stop4.setAttribute("offset", "85%");
      stop4.setAttribute("stop-color", "#666");
      stop4.setAttribute("stop-opacity", "0.2");
      
      const stop5 = document.createElementNS(svgNS, "stop");
      stop5.setAttribute("offset", "100%");
      stop5.setAttribute("stop-color", "#666");
      stop5.setAttribute("stop-opacity", "0");
      
      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      gradient.appendChild(stop3);
      gradient.appendChild(stop4);
      gradient.appendChild(stop5);
      
      const defs = document.createElementNS(svgNS, "defs");
      defs.appendChild(gradient);
      svg.appendChild(defs);
      
      path.setAttribute("stroke", `url(#${gradientId})`);
      
      // Get path length for animations
      const pathLength = path.getTotalLength();
      
      // Set up initial dash array and offset for the path
      path.setAttribute("stroke-dasharray", pathLength);
      path.setAttribute("stroke-dashoffset", pathLength);
      
      // Store path points for efficient lookup
      const pathPoints = [];
      const sampleCount = 500; // Number of points to sample along the path
      for (let j = 0; j <= sampleCount; j++) {
        const progress = j / sampleCount;
        pathPoints.push(path.getPointAtLength(pathLength * progress));
      }
      
      // Randomly determine if this particle will explode
      const willExplode = Math.random() < 0.7; // 70% chance to explode
      const explosionPoint = willExplode ? 
        (0.3 + Math.random() * 0.4) : // Explode between 30% and 70% of journey
        1.1; // No explosion (beyond journey end)
      
      // Animate the particle and path
      let startTime = Date.now();
      const delay = Math.random() * 3000; // Shorter delay to ensure particles appear quickly
      let animationFrameId;
      let exploded = false;
      let completed = false;
      
      const animateParticle = () => {
        const now = Date.now();
        const elapsed = (now - startTime - delay);
        const progress = (elapsed % (duration * 1000)) / (duration * 1000);
        
        if (elapsed < 0) {
          // Waiting for delay to complete
          animationFrameId = requestAnimationFrame(animateParticle);
          return;
        }
        
        // Make path visible once animation starts
        path.style.opacity = "1";
        particle.style.opacity = "1";
        
        // Find closest point index for current progress
        const pointIndex = Math.floor(progress * sampleCount);
        
        // Check if it's time to explode
        if (willExplode && !exploded && progress > explosionPoint && pointIndex < sampleCount) {
          exploded = true;
          
          // Get current position
          const point = pathPoints[pointIndex];
          
          // Create explosion effect
          createExplosion(point.x, point.y, size * 4);
          
          // Make particle burst
          particle.style.transform = `scale(1.5)`;
          particle.style.opacity = "0";
          
          // Fade out trail gracefully
          path.style.transition = "opacity 1.2s ease-out";
          path.style.opacity = "0";
          
          // Create a new particle to replace this one
          setTimeout(() => {
            createParticle();
            
            // Remove this particle from DOM after a delay
            path.remove();
            particle.remove();
            defs.remove();
            
            // Remove from active particles
            const index = activeParticles.findIndex(p => p.particle === particle);
            if (index !== -1) {
              activeParticles.splice(index, 1);
            }
          }, 800);
          
          // Stop this animation
          return;
        }
        
        // Only draw the path if the particle is inside the viewport and hasn't exploded
        if (!exploded && pointIndex > 0 && pointIndex < sampleCount) {
          // Calculate point position along the path
          const point = pathPoints[pointIndex];
          
          // Update particle position
          particle.style.left = (point.x - (size / 2)) + "px";
          particle.style.top = (point.y - (size / 2)) + "px";
          
          // Calculate trail length (30% of path traversed so far, but max 120px)
          const trailProgress = Math.max(0, progress - 0.1); // Start trail 10% behind particle
          const trailPointIndex = Math.max(0, Math.floor(trailProgress * sampleCount));
          const trailPoint = pathPoints[trailPointIndex];
          
          // Calculate actual length of trail segment in pixels
          const trailSegmentLength = calculateLength(trailPoint, point);
          const trailLength = Math.min(120, trailSegmentLength);
          
          // Create new path segment just for the visible trail
          const trailStartIndex = findPointForTrailStart(pointIndex, trailLength, pathPoints);
          const trailStartPoint = pathPoints[trailStartIndex];
          
          // Create a path just for this trail segment
          let trailPathData = `M ${trailStartPoint.x} ${trailStartPoint.y}`;
          for (let j = trailStartIndex + 1; j <= pointIndex; j++) {
            trailPathData += ` L ${pathPoints[j].x} ${pathPoints[j].y}`;
          }
          
          // Update path with just the trail segment
          path.setAttribute("d", trailPathData);
          path.setAttribute("stroke-dasharray", "none");
          path.setAttribute("stroke-dashoffset", "0");
          
          // Update gradient position to follow the trail
          gradient.setAttribute("x1", trailStartPoint.x);
          gradient.setAttribute("y1", trailStartPoint.y);
          gradient.setAttribute("x2", point.x);
          gradient.setAttribute("y2", point.y);
          
        } else if (progress > 0.95 && !exploded && !completed) {
          // Completed animation cycle without exploding
          completed = true;
          
          // Fade out gracefully
          particle.style.opacity = "0";
          path.style.opacity = "0";
          
          // Create a new particle to replace this one
          setTimeout(() => {
            createParticle();
            
            // Remove this particle from DOM after a delay
            path.remove();
            particle.remove();
            defs.remove();
            
            // Remove from active particles
            const index = activeParticles.findIndex(p => p.particle === particle);
            if (index !== -1) {
              activeParticles.splice(index, 1);
            }
          }, 800);
          
          // Stop this animation
          return;
        }
        
        animationFrameId = requestAnimationFrame(animateParticle);
      };
      
      // Helper function to calculate distance between two points
      const calculateLength = (p1, p2) => {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      };
      
      // Helper function to find the starting point for trail
      const findPointForTrailStart = (currentIndex, desiredLength, points) => {
        let length = 0;
        let index = currentIndex;
        
        while (index > 0 && length < desiredLength) {
          length += calculateLength(points[index], points[index - 1]);
          index--;
        }
        
        return index;
      };
      
      // Start animation
      animateParticle();
      
      // Track this particle
      activeParticles.push({
        particle,
        path,
        animationFrameId,
        cleanup: () => {
          cancelAnimationFrame(animationFrameId);
          path.remove();
          particle.remove();
          defs.remove();
        }
      });
      
      // Store animation ID for cleanup
      particle.dataset.animationId = animationFrameId;
    };
    
    // Initially create all particles
    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        createParticle();
      }, Math.random() * 2000); // Stagger initial creation
    }
  };
  
  createParticles();
  
  // Redraw everything if window resizes
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      // Cancel all animations
      const particles = heroAnimation.querySelectorAll('.pipeline-particle');
      particles.forEach(particle => {
        if (particle.dataset.animationId) {
          cancelAnimationFrame(parseInt(particle.dataset.animationId));
        }
      });
      
      // Clear everything
      heroAnimation.innerHTML = '';
      
      // Reset dimensions
      heroAnimation.style.width = heroSection.offsetWidth + 'px';
      heroAnimation.style.height = heroSection.offsetHeight + 'px';
      
      // Recreate elements
      createParticles();
    }, 200);
  });
}); 