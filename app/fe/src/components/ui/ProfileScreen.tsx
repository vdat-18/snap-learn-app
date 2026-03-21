import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Edit3 } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { MOCK_BADGES } from '../../store/mockData';
import BackgroundParallax from './BackgroundParallax';

interface ProfileScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ isOpen, onClose }) => {
    const { level, streak, collections, userName, userAvatar, xp } = useGameStore();
    const { playPop, playChime } = useSoundEffects();
    const [showParentGate, setShowParentGate] = useState(false);
    const [gateAnswer, setGateAnswer] = useState('');
    const pressTimer = useRef<any>(null);

    const handleSettingsPressStart = () => {
        pressTimer.current = setTimeout(() => {
            playChime();
            setShowParentGate(true);
        }, 2000); // 2 second hold
    };

    const handleSettingsPressEnd = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
        }
    };

    const evaluateBadge = (id: string): boolean => {
        switch (id) {
            case 'first_capture': return collections.length > 0;
            case 'ten_words': return collections.length >= 10;
            case 'fifty_words': return collections.length >= 50;
            case 'streak_7': return streak >= 7;
            case 'streak_14': return streak >= 14;
            case 'streak_30': return streak >= 30;
            case 'animal_lover': return collections.filter(w => w.category === 'Animals').length >= 20;
            case 'food_expert': return collections.filter(w => w.category === 'Food').length >= 15;
            case 'nature_explorer': return collections.filter(w => w.category === 'Nature').length >= 25;
            case 'school_star': return collections.filter(w => w.category === 'School').length >= 18;
            case 'home_hero': return collections.filter(w => w.category === 'Home').length >= 22;
            case 'vehicle_master': return collections.filter(w => w.category === 'Vehicles').length >= 12;
            case 'first_evolution': return collections.some(w => w.isEvolved);
            case 'pronunciation_star': return collections.filter(w => w.stars === 3).length >= 50;
            case 'explorer': return new Set(collections.map(w => w.category)).size >= 5;
            default: return false;
        }
    };

    const badges = MOCK_BADGES.map((b: any) => ({
        id: b.id,
        name: b.name_vi,
        icon: b.icon,
        description: b.description_vi,
        earned: evaluateBadge(b.id)
    }));


    // Calculate favorite category
    const categoryCount: Record<string, number> = {};
    collections.forEach(w => {
        categoryCount[w.category] = (categoryCount[w.category] || 0) + 1;
    });
    const favoriteCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
    const categoryEmojis: Record<string, string> = {
        'Animals': '🐾',
        'Food': '🍎',
        'Home': '🏠',
        'School': '📚',
        'Nature': '🌿',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[170] bg-snowWhite flex flex-col font-sans"
                >
                    {/* Header (icon-driven, minimal text) */}
                    <header className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <button onClick={() => { playPop(); onClose(); }} className="w-12 h-12 bg-white rounded-2xl shadow-level-2 flex items-center justify-center border-t-2 border-white/40">
                                <X className="w-8 h-8 text-deepNavy" />
                            </button>
                            <h1 className="text-lg font-black text-deepNavy tracking-tight flex items-center gap-3">
                                <img src="/icon-me.png" alt="" className="w-10 h-10 object-contain mix-blend-multiply" />
                                Nhà của Bạn
                            </h1>
                        </div>
                        <button
                            onMouseDown={handleSettingsPressStart}
                            onMouseUp={handleSettingsPressEnd}
                            onTouchStart={handleSettingsPressStart}
                            onTouchEnd={handleSettingsPressEnd}
                            className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 active:scale-95 transition-all shadow-inner"
                        >
                            <Settings className="w-7 h-7" />
                        </button>
                    </header>

                    <BackgroundParallax className="flex-1 flex flex-col">
                        <div className="flex-1 overflow-y-auto px-6 pt-8 pb-60">
                            {/* Avatar & Name Area */}
                            <div className="flex flex-col items-center mb-10 text-center">
                                <div className="relative mb-4">
                                    <div className="w-32 h-32 rounded-full border-8 border-white shadow-level-3 overflow-hidden bg-white relative">
                                        <img src={userAvatar || '/avatar-owl.png'} alt="Avatar" className="w-full h-full object-cover" />
                                        {/* Edit Avatar Overlay */}
                                        <button
                                            onClick={() => {
                                                playPop();
                                                // TODO: Implement Avatar Selection Modal
                                                alert("Tính năng đổi Avatar sắp ra mắt nha! 🦉");
                                            }}
                                            className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                                        >
                                            <Edit3 className="text-white w-8 h-8 drop-shadow-md" />
                                        </button>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-skyBlue p-2 rounded-2xl border-4 border-white shadow-level-1">
                                        <span className="text-white font-black text-sm">{level}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            playPop();
                                            alert("Tính năng đổi Avatar sắp ra mắt nha! 🦉");
                                        }}
                                        className="absolute -bottom-2 -left-2 bg-white p-2 rounded-2xl border-4 border-slate-50 shadow-level-1 text-slate-400 hover:text-skyBlue active:scale-95 transition-all"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                </div>

                                <h2 className="text-2xl font-black text-deepNavy mb-1 uppercase tracking-tight">{userName || 'Explorer'}</h2>
                                <div className="w-full max-w-[200px] mt-2">
                                    <div className="flex justify-between text-[10px] font-black text-sky-400 mb-1.5 px-1 uppercase tracking-wider">
                                        <span>{xp % 100}/100 XP</span>
                                        <span>Cấp {level}</span>
                                    </div>
                                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${xp % 100}%` }}
                                            className="h-full bg-gradient-to-r from-sunshineYellow to-orange-400 rounded-full shadow-[0_0_10px_rgba(255,180,0,0.4)]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Summary Stats Grid - Gamified Dashboard Style */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <motion.div
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white p-4 rounded-[28px] shadow-level-1 text-center border-b-4 border-slate-100 flex flex-col items-center"
                                >
                                    <span className="block text-3xl mb-1">📖</span>
                                    <span className="block text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">Bài học</span>
                                    <span className="block text-xl font-black text-deepNavy">{collections.length}</span>
                                </motion.div>

                                <motion.div
                                    animate={{
                                        scale: [1, 1.05, 1],
                                        filter: ["drop-shadow(0 0 2px rgba(239,68,68,0.1))", "drop-shadow(0 0 6px rgba(239,68,68,0.3))", "drop-shadow(0 0 2px rgba(239,68,68,0.1))"]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white p-4 rounded-[28px] shadow-level-1 text-center border-b-4 border-orange-100 flex flex-col items-center"
                                >
                                    <span className="block text-3xl mb-1">🔥</span>
                                    <span className="block text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">Chuỗi</span>
                                    <span className="block text-xl font-black text-deepNavy">{streak}</span>
                                </motion.div>

                                <motion.div
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white p-4 rounded-[28px] shadow-level-1 text-center border-b-4 border-yellow-100 flex flex-col items-center"
                                >
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="block text-3xl mb-1"
                                    >
                                        ⭐
                                    </motion.span>
                                    <span className="block text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">Sao</span>
                                    <span className="block text-xl font-black text-deepNavy">{xp}</span>
                                </motion.div>
                            </div>

                            {/* Quick Mission Summary */}
                            <section className="bg-white/60 backdrop-blur-sm rounded-[32px] p-6 border-b-4 border-slate-100 mb-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-black text-deepNavy uppercase tracking-wider flex items-center gap-2">
                                        🚀 Nhiệm vụ hôm nay
                                    </h3>
                                    <span className="text-[10px] font-black text-skyBlue underline">Xem tất cả</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-sm">🌅</div>
                                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                                            <div className="h-full w-2/3 bg-orange-400 rounded-full" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400">2/3</span>
                                    </div>
                                </div>
                            </section>

                            {/* Badge Showcase */}
                            <section className="mb-10">
                                <h3 className="text-lg font-black text-deepNavy mb-6 flex items-center gap-2">
                                    <span className="text-xl">🎖️</span> Huy hiệu
                                </h3>
                                <div className="grid grid-cols-3 gap-6">
                                    {badges.slice(0, 9).map((badge) => (
                                        <div key={badge.id} className="flex flex-col items-center text-center">
                                            <div
                                                className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-2 shadow-level-2 transition-all duration-500 ${badge.earned
                                                    ? 'bg-white border-2 border-sunshineYellow rotate-0'
                                                    : 'bg-slate-100 border-2 border-dashed border-slate-200 grayscale opacity-40 -rotate-3'
                                                    }`}
                                                title={badge.description}
                                            >
                                                {badge.earned ? badge.icon : '🔒'}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-tight ${badge.earned ? 'text-deepNavy' : 'text-slate-300'}`}>
                                                {badge.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Favorite Category */}
                            <section className="bg-gradient-to-br from-sky-400 to-sky-600 rounded-[32px] p-6 text-white shadow-level-3 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-xs font-black uppercase tracking-[2px] opacity-70 mb-2">Chủ đề yêu thích</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="text-5xl">{favoriteCategory ? categoryEmojis[favoriteCategory[0]] || '📚' : '🎯'}</div>
                                        <div>
                                            <h4 className="text-xl font-black">{favoriteCategory ? favoriteCategory[0] : 'Chưa có'}</h4>
                                            <p className="text-white/80 font-bold text-sm">{favoriteCategory ? `${favoriteCategory[1]} từ vựng` : 'Bắt đầu ngay!'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            </section>
                        </div>
                    </BackgroundParallax>

                    {/* Parent Gate Modal */}
                    <AnimatePresence>
                        {showParentGate && (
                            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-deepNavy/80 backdrop-blur-md"
                                />
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="bg-white rounded-[40px] p-10 w-full max-w-sm relative z-10 shadow-level-3 text-center"
                                >
                                    <div className="text-7xl mb-6">🛡️</div>
                                    <h3 className="text-xl font-black text-deepNavy mb-4">Phụ Huynh</h3>
                                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">Hãy giúp bạn giải phép tính này để vào phần cài đặt nhé!</p>
                                    <div className="bg-slate-50 rounded-3xl p-8 mb-8">
                                        <span className="text-3xl font-black text-sky-500 tracking-widest">7 + 8 = ?</span>
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="Kết quả là..."
                                        value={gateAnswer}
                                        onChange={(e) => setGateAnswer(e.target.value)}
                                        className="w-full bg-slate-100 rounded-2xl py-5 px-6 text-center text-2xl font-black text-deepNavy focus:outline-none focus:ring-4 focus:ring-sky-200 mb-6"
                                    />
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => { playPop(); setShowParentGate(false); }}
                                            className="flex-1 py-4 font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (gateAnswer === '15') {
                                                    playChime();
                                                    alert("Cài đặt phụ huynh (Sắp ra mắt!)");
                                                    setShowParentGate(false);
                                                } else {
                                                    alert("Sai rồi! Nhờ bố mẹ giúp nhé.");
                                                }
                                            }}
                                            className="flex-1 bg-sky-500 text-white py-4 rounded-2xl font-black shadow-[0_6px_0_rgba(14,165,233,0.3)]"
                                        >
                                            OK
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProfileScreen;
