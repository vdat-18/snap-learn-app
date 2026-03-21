import { useCallback, useRef } from 'react';

export const useSoundEffects = () => {
  const audioContext = useRef<AudioContext | null>(null);

  const initAudioContext = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
  };

  /**
   * Play a synth 'Pop' sound for UI interactions
   */
  const playPop = useCallback(() => {
    try {
      initAudioContext();
      const ctx = audioContext.current!;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('Audio context failed', e);
    }
  }, []);

  /**
   * Play a 'Camera Shutter' sound
   */
  const playShutter = useCallback(() => {
    try {
      initAudioContext();
      const ctx = audioContext.current!;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn('Audio context failed', e);
    }
  }, []);

  /**
   * Play a 'Quest Complete' or 'Level Up' chime
   */
  const playChime = useCallback(() => {
    try {
      initAudioContext();
      const ctx = audioContext.current!;

      const playNote = (freq: number, time: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + 0.3);
      };

      playNote(523.25, 0); // C5
      playNote(659.25, 0.1); // E5
      playNote(783.99, 0.2); // G5
      playNote(1046.50, 0.3); // C6
    } catch (e) {
      console.warn('Audio context failed', e);
    }
  }, []);

  return { playPop, playShutter, playChime };
};
