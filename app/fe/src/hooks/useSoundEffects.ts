import { useCallback } from 'react';

export type SoundType = 
  | 'capture'
  | 'reveal'
  | 'reveal-legendary'
  | 'correct'
  | 'perfect'
  | 'wrong'
  | 'xp-gain'
  | 'level-up'
  | 'evolve'
  | 'mission-complete';

interface SoundConfig {
  type: SoundType;
  url: string;
  volume: number;
}

const SOUNDS: Record<SoundType, SoundConfig> = {
  'capture': {
    type: 'capture',
    url: '/sounds/capture.mp3',
    volume: 0.7,
  },
  'reveal': {
    type: 'reveal',
    url: '/sounds/reveal.mp3',
    volume: 0.6,
  },
  'reveal-legendary': {
    type: 'reveal-legendary',
    url: '/sounds/reveal-legendary.mp3',
    volume: 0.8,
  },
  'correct': {
    type: 'correct',
    url: '/sounds/correct.mp3',
    volume: 0.7,
  },
  'perfect': {
    type: 'perfect',
    url: '/sounds/perfect.mp3',
    volume: 0.8,
  },
  'wrong': {
    type: 'wrong',
    url: '/sounds/wrong.mp3',
    volume: 0.6,
  },
  'xp-gain': {
    type: 'xp-gain',
    url: '/sounds/xp-gain.mp3',
    volume: 0.5,
  },
  'level-up': {
    type: 'level-up',
    url: '/sounds/level-up.mp3',
    volume: 0.9,
  },
  'evolve': {
    type: 'evolve',
    url: '/sounds/evolve.mp3',
    volume: 0.8,
  },
  'mission-complete': {
    type: 'mission-complete',
    url: '/sounds/mission-complete.mp3',
    volume: 0.7,
  },
};

export const useSoundEffects = () => {
  // Cache for Audio objects
  const audioCache = new Map<SoundType, HTMLAudioElement>();

  const playSound = useCallback((soundType: SoundType) => {
    // Check if audio is globally disabled (e.g., muted by parent)
    const audioElement = document.querySelector('audio');
    if (audioElement?.muted) {
      return;
    }

    const config = SOUNDS[soundType];
    if (!config) {
      console.warn(`[SoundEffects] Unknown sound type: ${soundType}`);
      return;
    }

    try {
      // Try to get from cache
      let audio = audioCache.get(soundType);
      
      if (!audio) {
        // Create new audio element
        audio = new Audio(config.url);
        audio.volume = Math.min(config.volume, 1);
        audioCache.set(soundType, audio);
      }

      // Reset and play
      audio.currentTime = 0;
      audio.volume = Math.min(config.volume, 1);
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn(`[SoundEffects] Failed to play sound "${soundType}":`, error);
        });
      }
    } catch (error) {
      console.warn(`[SoundEffects] Error playing sound:`, error);
    }
  }, []);

  const stopSound = useCallback((soundType: SoundType) => {
    const audio = audioCache.get(soundType);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const stopAllSounds = useCallback(() => {
    audioCache.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  const setVolume = useCallback((soundType: SoundType, volume: number) => {
    const audio = audioCache.get(soundType);
    if (audio) {
      audio.volume = Math.max(0, Math.min(volume, 1));
    }
  }, []);

  const preloadSound = useCallback((soundType: SoundType) => {
    const config = SOUNDS[soundType];
    if (!config) {
      console.warn(`[SoundEffects] Unknown sound type: ${soundType}`);
      return;
    }

    if (!audioCache.has(soundType)) {
      try {
        const audio = new Audio(config.url);
        audio.volume = Math.min(config.volume, 1);
        audio.preload = 'auto';
        audioCache.set(soundType, audio);
      } catch (error) {
        console.warn(`[SoundEffects] Error preloading sound:`, error);
      }
    }
  }, []);

  // Preload all sounds on first call
  if (audioCache.size === 0) {
    Object.keys(SOUNDS).forEach((key) => {
      preloadSound(key as SoundType);
    });
  }

  return {
    playSound,
    stopSound,
    stopAllSounds,
    setVolume,
    preloadSound,
  };
};

export default useSoundEffects;
