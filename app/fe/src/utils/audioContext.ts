/**
 * Shared global AudioContext for the entire app.
 *
 * Mobile browsers block `new Audio().play()` outside user gestures.
 * By creating a single AudioContext and resuming it during a user tap
 * (e.g. the camera capture button), all subsequent audio playback via
 * `AudioBufferSourceNode.start()` is allowed — even after async gaps
 * (like waiting for an AI response).
 *
 * Usage:
 *   - Call `unlockAudioContext()` inside any click/tap handler (e.g. capture button)
 *   - Call `playAudioFromUrl(blobUrl)` to play TTS audio through the unlocked context
 *   - Call `stopCurrentAudioContext()` to interrupt playback
 */

let sharedCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

/**
 * Get (or lazily create) the shared AudioContext singleton.
 */
export function getAudioContext(): AudioContext {
    if (!sharedCtx) {
        sharedCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return sharedCtx;
}

/**
 * Unlock the AudioContext — must be called during a user gesture (click/tap).
 * Once resumed, it stays unlocked for the entire session.
 */
export function unlockAudioContext(): void {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
}

/**
 * Stop any currently playing AudioBufferSourceNode.
 */
export function stopCurrentAudioContext(): void {
    if (currentSource) {
        try {
            currentSource.stop();
        } catch {
            // Already stopped — ignore
        }
        currentSource = null;
    }
}

/**
 * Play audio from a URL (blob URL or network URL) through the shared AudioContext.
 *
 * Returns a Promise that resolves when playback completes.
 * Automatically stops any previous source before starting.
 */
export async function playAudioFromUrl(url: string): Promise<void> {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        await ctx.resume();
    }

    // Stop any currently playing source
    stopCurrentAudioContext();

    // Fetch the audio data
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    return new Promise<void>((resolve) => {
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        currentSource = source;

        source.onended = () => {
            if (currentSource === source) {
                currentSource = null;
            }
            resolve();
        };

        source.start();
    });
}
