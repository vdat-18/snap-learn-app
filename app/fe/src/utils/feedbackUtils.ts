/**
 * Triggers a vibration on supported devices (Android/WebXR)
 * @param pattern ms of vibration/pause (e.g., 50ms pulse)
 */
export const triggerHaptic = (pattern: number | number[] = 50) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            console.warn('Haptics not supported or blocked by user policy');
        }
    }
};

/**
 * Mascot motivational phrases in Vietnamese
 */
const MOTIVATIONAL_PHRASES = [
    "Wow! Bé giỏi quá, săn được từ mới rồi này!",
    "Tuyệt vời! Chúng mình cùng tìm thêm nhé!",
    "Bé tinh mắt thật đấy, phần thưởng đây rồi!",
    "Một từ vựng thật thú vị! Bé nhớ phát âm theo nhé!",
    "Khám phá thế giới thật vui! Bé là nhà thám hiểm tài ba!",
    "Cố lên bé ơi, bộ sưu tập sắp đầy rồi này!"
];

/**
 * Speak text using Web Speech API (TTS)
 */
export const mascotSpeak = (text?: string, lang: 'vi-VN' | 'en-US' | 'zh-CN' = 'vi-VN') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const startSpeak = () => {
        // Force engine to resume 
        window.speechSynthesis.resume();

        // Reset previous speech
        window.speechSynthesis.cancel();

        const phrase = text || MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];

        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.lang = lang;
        utterance.rate = 1.0;

        // --- ADVANCED VOICE HUNTING STRATEGY ---
        const voices = window.speechSynthesis.getVoices();

        // Priority 1: Google High-Quality AI voices (Best for VN)
        // Priority 2: Natural/Native voices of the OS
        // Priority 3: Fallback lang match
        let selectedVoice = voices.find(v =>
            v.lang.replace('_', '-').includes(lang) &&
            (v.name.includes('Google') || v.name.includes('Natural'))
        ) || voices.find(v => v.lang.replace('_', '-').includes(lang)) ||
            voices.find(v => v.lang.startsWith(lang.split('-')[0]));

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            // console.log(`[Mascot] Using Voice: ${selectedVoice.name}`);
        }

        // Pitch adjustment for child-friendly voice
        // Note: Some high-quality Google voices ignore pitch, but we set it anyway
        if (lang === 'vi-VN') utterance.pitch = 1.2;
        else if (lang === 'en-US') utterance.pitch = 1.1;
        else utterance.pitch = 1.0;

        window.speechSynthesis.speak(utterance);

        // Extra insurance for Desktop Chrome
        setTimeout(() => {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            }
        }, 100);
    };

    // Chrome workaround for voice loading
    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
            startSpeak();
        }, { once: true });
        window.speechSynthesis.getVoices();
    } else {
        startSpeak();
    }
};
