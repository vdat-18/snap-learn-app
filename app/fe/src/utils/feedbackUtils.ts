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
export const mascotSpeak = (text?: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Reset previous speech
    window.speechSynthesis.cancel();

    const phrase = text || MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];

    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.pitch = 1.2; // Slightly higher pitch for child-friendly mascot voice

    window.speechSynthesis.speak(utterance);
};
