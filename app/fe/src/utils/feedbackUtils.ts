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
 * Mascot motivational phrases in Vietnamese (Short & Sweet)
 */
const MOTIVATIONAL_PHRASES = [
    "Oa! Quà xịn đây rồi nè!",
    "Tuyệt quá! Tìm thêm từ nữa đi!",
    "Bạn tinh mắt thật! Tiếp thôi!",
    "Từ này hay quá! Tập nói nha!",
    "Bạn nhạy bén thật! Sâu ơi!",
    "Sắp đầy kho báu rồi! Cố lên!"
];

/**
 * Speak text using Web Speech API (TTS)
 */
export const mascotSpeak = (text?: string, lang: 'vi-VN' | 'en-US' | 'zh-CN' = 'vi-VN', forceInterrupt = false) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const startSpeak = () => {
        // Force engine to resume 
        window.speechSynthesis.resume();

        // Optional interrupt (can cause skipping if triggered too fast)
        if (forceInterrupt) {
            window.speechSynthesis.cancel();
        }

        const phrase = text || MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];
        console.log(`[TTS] Speaking: ${phrase} (${lang})`);

        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.lang = lang;
        utterance.rate = 1.0;

        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = voices.find(v =>
            v.lang.replace('_', '-').includes(lang) &&
            (v.name.includes('Google') || v.name.includes('Natural'))
        ) || voices.find(v => v.lang.replace('_', '-').includes(lang)) ||
            voices.find(v => v.lang.startsWith(lang.split('-')[0]));

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.pitch = 1.1;

        // Small delay for stability before calling speak
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 50);

        // Extra insurance for Desktop Chrome
        setTimeout(() => {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            }
        }, 150);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
            startSpeak();
        }, { once: true });
        window.speechSynthesis.getVoices();
    } else {
        startSpeak();
    }
};
