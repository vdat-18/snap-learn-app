/**
 * Confetti & Particle Effects Utility
 * Provides lightweight confetti animations using CSS and canvas
 */

interface ConfettiConfig {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  duration?: number;
  colors?: string[];
}

/**
 * Trigger confetti explosion animation
 * Uses pure CSS/canvas for performance
 */
export const triggerConfetti = (config: ConfettiConfig = {}) => {
  const {
    particleCount = 50,
    spread = 45,
    startVelocity = 30,
    decay = 0.95,
    duration = 3000,
    colors = ['#FFD634', '#FF6B6B', '#4DA8FF', '#50C878', '#FFB6D9']
  } = config;

  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
  }> = [];

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.random() * spread * 2 - spread) * (Math.PI / 180);
    const velocity = startVelocity + Math.random() * 20;

    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: Math.random() * 0.2 - 0.1
    });
  }

  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach((particle) => {
      // Apply gravity
      particle.vy += 0.5;

      // Apply decay (air resistance)
      particle.vx *= decay;
      particle.vy *= decay;

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Update rotation
      particle.rotation += particle.rotationSpeed;

      // Calculate fade out
      const opacity = Math.max(0, 1 - progress);

      // Draw particle
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.fillStyle = particle.color;
      ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      ctx.restore();
    });

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  };

  animate();
};

/**
 * Trigger sparkle/shine particles around a point
 */
export const triggerSparkles = (x: number, y: number, count: number = 20) => {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
  }> = [];

  // Golden sparkle colors
  const colors = ['#FFD700', '#FFA500', '#FFE4B5', '#FFDAB9'];

  // Initialize sparkles
  for (let i = 0; i < count; i++) {
    const angle = (Math.random() * Math.PI * 2);
    const velocity = 2 + Math.random() * 4;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      size: Math.random() * 6 + 2,
      opacity: 1
    });
  }

  const startTime = Date.now();
  const duration = 1500;

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      particle.vy += 0.1; // gravity
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.opacity = Math.max(0, 1 - progress * 1.2);

      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  };

  animate();
};

/**
 * Trigger a legendary rarity burst effect
 */
export const triggerLegendaryBurst = () => {
  triggerConfetti({
    particleCount: 80,
    spread: 120,
    startVelocity: 40,
    duration: 4000,
    colors: ['#FFD700', '#FF69B4', '#87CEEB', '#FF8C00', '#32CD32']
  });

  // Add sparkles at multiple points
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 3;
  triggerSparkles(centerX, centerY, 30);
  triggerSparkles(centerX - 100, centerY + 100, 15);
  triggerSparkles(centerX + 100, centerY + 100, 15);
};

/**
 * Trigger a perfect score burst
 */
export const triggerPerfectBurst = () => {
  triggerConfetti({
    particleCount: 60,
    spread: 70,
    startVelocity: 35,
    duration: 2500,
    colors: ['#FFD634', '#FF6B6B', '#50C878']
  });
  
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  triggerSparkles(centerX, centerY, 25);
};

export default {
  triggerConfetti,
  triggerSparkles,
  triggerLegendaryBurst,
  triggerPerfectBurst
};
