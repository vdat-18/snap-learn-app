import confetti from 'canvas-confetti';

/**
 * Trigger a standard confetti burst
 */
export const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FFD634', '#FF6B6B', '#4DA8FF', '#50C878', '#FFB6D9']
  });
};

/**
 * Trigger a legendary rarity explosion (Side Cannons)
 */
export const triggerLegendaryBurst = () => {
  const end = Date.now() + (3 * 1000);
  const colors = ['#FFD700', '#FFDAB9', '#FFA500'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
};

/**
 * Trigger sparkles around a specific point
 */
export const triggerSparkles = (x: number, y: number) => {
  confetti({
    particleCount: 30,
    spread: 360,
    startVelocity: 30,
    origin: {
      x: x / window.innerWidth,
      y: y / window.innerHeight
    },
    colors: ['#FFD700', '#FFFFFF'],
    ticks: 60
  });
};

/**
 * Trigger perfect score burst (Center)
 */
export const triggerPerfectBurst = () => {
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#FFD634', '#50C878', '#FFFFFF']
  });
};
