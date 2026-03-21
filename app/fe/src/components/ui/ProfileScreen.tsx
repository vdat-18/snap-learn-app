import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Loader2, Download } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { profileApi, type ProfileResponse } from '../../services/profileApi';
import { parentApi, type ChallengeResponse, type DashboardResponse } from '../../services/parentApi';
import { ProfileSkeleton } from './Skeleton';

interface ProfileScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ isOpen, onClose }) => {
    const { level, streak, collections, userName, userAvatar, xp, childId } = useGameStore();
    const { playPop, playChime } = useSoundEffects();
    const [showParentGate, setShowParentGate] = useState(false);
    const [showParentDashboard, setShowParentDashboard] = useState(false);
    const [gateAnswer, setGateAnswer] = useState('');
    const [gateChallenge, setGateChallenge] = useState<ChallengeResponse | null>(null);
    const [gateError, setGateError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const pressTimer = useRef<any>(null);

    // Server profile data
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
    const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
    const [profileError, setProfileError] = useState(false);

    const loadProfile = () => {
        setIsLoadingProfile(true);
        setProfileError(false);
        profileApi.getProfile()
            .then(data => setProfile(data))
            .catch(() => setProfileError(true))
            .finally(() => setIsLoadingProfile(false));
    };

    // Fetch profile from API when opened
    useEffect(() => {
        if (isOpen) {
            loadProfile();
        }
    }, [isOpen]);

    const handleSettingsPressStart = () => {
        pressTimer.current = setTimeout(async () => {
            playChime();
            // Fetch challenge from server
            try {
                const challenge = await parentApi.getChallenge();
                setGateChallenge(challenge);
                setShowParentGate(true);
                setGateAnswer('');
                setGateError('');
            } catch (err) {
                console.error('Failed to get challenge:', err);
                // Fallback to hardcoded challenge
                setGateChallenge({ challenge_id: 'fallback', question: '7 + 8 = ?' });
                setShowParentGate(true);
                setGateAnswer('');
                setGateError('');
            }
        }, 2000);
    };

    const handleSettingsPressEnd = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
        }
    };

    const handleVerifyGate = async () => {
        if (!gateAnswer.trim() || !gateChallenge) return;

        setIsVerifying(true);
        setGateError('');

        try {
            const result = await parentApi.verifyChallenge(
                gateChallenge.challenge_id,
                parseInt(gateAnswer, 10)
            );

            if (result.verified) {
                playChime();
                setShowParentGate(false);

                // Store parent token if provided
                if (result.parent_token) {
                    localStorage.setItem('snap-learn-parent-token', result.parent_token);
                }

                // Load parent dashboard
                setShowParentDashboard(true);
                setIsLoadingDashboard(true);
                try {
                    const dashData = await parentApi.getDashboard(childId || '');
                    setDashboard(dashData);
                } catch (err) {
                    console.error('Failed to load dashboard:', err);
                } finally {
                    setIsLoadingDashboard(false);
                }
            } else {
                setGateError('Sai rồi! Nhờ bố mẹ giúp nhé.');
            }
        } catch (err) {
            // Fallback for hardcoded challenge
            if (gateChallenge.challenge_id === 'fallback' && gateAnswer === '15') {
                playChime();
                setShowParentGate(false);
                setShowParentDashboard(true);
            } else {
                setGateError('Sai rồi! Nhờ bố mẹ giúp nhé.');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleExportCSV = async () => {
        if (!childId) return;
        try {
            await parentApi.exportCSV(childId);
        } catch (err) {
            console.error('Export failed:', err);
        }
    };

    // Use server profile data when available
    const displayLevel = profile?.level || level;
    const displayStreak = profile?.current_streak || streak;
    const displayXP = profile?.total_xp || xp;
    const displayName = profile?.name || userName;

    const badges = profile?.badges?.map(b => ({
        id: b.id,
        name: b.name_vi,
        icon: b.icon,
        description: b.description_vi,
        earned: b.earned,
    })) || [];

    // LEVEL PROGRESS CALCULATION
    const LEVEL_THRESHOLDS = [
        { level: 1, xp: 0 },
        { level: 5, xp: 500 },
        { level: 10, xp: 2000 },
        { level: 20, xp: 8000 },
        { level: 35, xp: 25000 },
        { level: 50, xp: 60000 },
    ];

    const getLevelProgress = () => {
        const currentXP = displayXP;
        let startXP = 0;
        let endXP = 500;

        for (let i = 0; i < LEVEL_THRESHOLDS.length - 1; i++) {
            if (currentXP >= LEVEL_THRESHOLDS[i].xp && currentXP < LEVEL_THRESHOLDS[i + 1].xp) {
                startXP = LEVEL_THRESHOLDS[i].xp;
                endXP = LEVEL_THRESHOLDS[i + 1].xp;
                break;
            }
            if (i === LEVEL_THRESHOLDS.length - 2 && currentXP >= LEVEL_THRESHOLDS[i + 1].xp) {
                startXP = LEVEL_THRESHOLDS[i + 1].xp;
                endXP = LEVEL_THRESHOLDS[i + 1].xp * 2; // Arbitrary next
            }
        }

        const progress = (currentXP - startXP) / (endXP - startXP);
        return Math.min(Math.max(progress, 0), 1);
    };

    const levelProgressPercent = getLevelProgress();
    const circumference = 2 * Math.PI * 66; // r=66 for 132x132 container
    const strokeDashoffset = circumference - (levelProgressPercent * circumference);

    const totalWords = profile?.stats?.total_words || collections.length;

    // Category progress calculations
    const CATEGORY_ICONS: Record<string, string> = {
        'animals': '🐾', 'food': '🍎', 'nature': '🌿', 'household': '🏠',
        'school': '📚', 'vehicles': '🚗', 'clothing': '👕', 'toys': '🧸',
        'colors': '🎨', 'technology': '💻', 'sports': '⚽'
    };
    const CATEGORY_NAMES: Record<string, string> = {
        'animals': 'Động vật', 'food': 'Đồ ăn', 'nature': 'Tự nhiên', 'household': 'Nhà cửa',
        'school': 'Trường học', 'vehicles': 'Giao thông', 'clothing': 'Quần áo', 'toys': 'Đồ chơi',
        'colors': 'Màu sắc', 'technology': 'Công nghệ', 'sports': 'Thể thao'
    };

    const categoryStats = Object.keys(CATEGORY_NAMES).map(catId => {
        const count = collections.filter(w => w.category.toLowerCase() === catId).length;
        return { id: catId, name: CATEGORY_NAMES[catId], icon: CATEGORY_ICONS[catId] || '✨', count };
    }).filter(s => s.count > 0);

    const recentCaptures = profile?.recent_captures?.map(rc => ({
        id: rc.id,
        word_en: rc.word_en,
        image: rc.photo_url,
        capturedAt: new Date().toISOString() // Not key here, just for sort if needed
    })) || [];

    const mascotMessages = [
        "Oa! Bạn đã sưu tầm được quá trời từ vựng luôn!",
        "Hôm nay chúng mình cùng khám phá thêm thẻ mới nhé?",
        "Bạn là thám hiểm nhí tài ba nhất mà tớ từng thấy!",
        "Đừng quên luyện tập phát âm mỗi ngày để thẻ bài tiến hóa nha!"
    ];
    const mascotMsg = mascotMessages[Math.floor((xp / 50) % mascotMessages.length)];

    // --- PARENT DASHBOARD VIEW ---
    if (showParentDashboard) {
        return (
            <div className="fixed inset-0 z-[170] bg-white flex flex-col font-sans">
                <header className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowParentDashboard(false)} className="w-12 h-12 bg-white rounded-2xl shadow-level-2 flex items-center justify-center border-t-2 border-white/40">
                            <X className="w-8 h-8 text-deepNavy" />
                        </button>
                        <h1 className="text-lg font-black text-deepNavy">🛡️ Phụ Huynh Dashboard</h1>
                    </div>
                    <button onClick={handleExportCSV} className="flex items-center gap-2 bg-skyBlue/10 px-3 py-2 rounded-xl text-skyBlue">
                        <Download className="w-4 h-4" />
                        <span className="text-xs font-black">CSV</span>
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
                    {isLoadingDashboard ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-skyBlue animate-spin" />
                        </div>
                    ) : dashboard ? (
                        <>
                            <div className="bg-skyBlue/10 rounded-[32px] p-6">
                                <h3 className="font-black text-deepNavy mb-4">Tổng quan</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl text-center">
                                        <span className="block text-2xl mb-1">📖</span>
                                        <span className="block text-xl font-black text-deepNavy">{totalWords}</span>
                                        <span className="text-[10px] font-bold text-slate-400">Từ vựng</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl text-center">
                                        <span className="block text-2xl mb-1">⭐</span>
                                        <span className="block text-xl font-black text-deepNavy">{displayXP}</span>
                                        <span className="text-[10px] font-bold text-slate-400">Tổng XP</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl text-center">
                                        <span className="block text-2xl mb-1">🔥</span>
                                        <span className="block text-xl font-black text-deepNavy">{displayStreak}</span>
                                        <span className="text-[10px] font-bold text-slate-400">Chuỗi ngày</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl text-center">
                                        <span className="block text-2xl mb-1">🎯</span>
                                        <span className="block text-xl font-black text-deepNavy">Cấp {displayLevel}</span>
                                        <span className="text-[10px] font-bold text-slate-400">Level</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 text-center">Thêm tính năng dashboard đang được phát triển...</p>
                        </>
                    ) : (
                        <p className="text-center text-slate-400 font-bold py-20">Không thể tải dữ liệu.</p>
                    )}
                </div>
            </div>
        );
    }

    // --- MAIN PROFILE VIEW ---
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

                    <div className="flex-1 overflow-y-auto px-6 pt-8 pb-32">
                        {isLoadingProfile && (
                            <ProfileSkeleton />
                        )}

                        {profileError && !isLoadingProfile && (
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <span className="text-5xl">😴</span>
                                <p className="text-base font-black text-deepNavy">Ối! Không tải được hồ sơ</p>
                                <p className="text-sm text-slate-400 font-bold">Kiểm tra kết nối mạng rồi thử lại nhé!</p>
                                <button onClick={loadProfile} className="bg-skyBlue text-white px-6 py-3 rounded-2xl font-black text-sm shadow-level-2">
                                    🔄 Thử lại
                                </button>
                            </div>
                        )}

                        {/* Avatar & Name */}
                        <div className="flex flex-col items-center mb-10 text-center relative mt-16">
                            {/* Avatar Speech Bubble */}
                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-[28px] shadow-level-3 border-2 border-skyBlue/30 max-w-[180px] relative"
                                >
                                    <p className="text-[11px] font-black text-deepNavy leading-tight text-center">
                                        {mascotMsg}
                                    </p>
                                    {/* Bubble Tail pointing to Avatar */}
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-skyBlue/30 rotate-45" />
                                </motion.div>
                            </div>

                            <div className="relative mb-4 group">
                                <div className="relative w-36 h-36 flex items-center justify-center">
                                    {/* Circular Progress SVG */}
                                    <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 144 144">
                                        <circle
                                            cx="72" cy="72" r="66"
                                            fill="none" stroke="#f1f5f9" strokeWidth="8"
                                        />
                                        <motion.circle
                                            cx="72" cy="72" r="66"
                                            fill="none"
                                            stroke="url(#levelGradient)"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                                            animate={{ strokeDashoffset: strokeDashoffset }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                        <defs>
                                            <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#0EA5E9" />
                                                <stop offset="100%" stopColor="#10B981" />
                                            </linearGradient>
                                        </defs>
                                    </svg>

                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="w-28 h-28 rounded-[38px] overflow-hidden relative z-10 bg-white shadow-inner"
                                    >
                                        <img
                                            src={userAvatar?.startsWith('http') || userAvatar?.startsWith('/') ? userAvatar : `/avatar-owl.png`}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/avatar-owl.png';
                                            }}
                                        />
                                    </motion.div>
                                </div>

                                <motion.div
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute -bottom-1 -right-1 bg-gradient-to-br from-skyBlue to-deepNavy p-2.5 rounded-2xl border-4 border-white shadow-level-2 z-20"
                                >
                                    <span className="text-white font-black text-sm">{displayLevel}</span>
                                </motion.div>
                            </div>
                            <h2 className="text-2xl font-black text-deepNavy mb-1 uppercase tracking-tight">{displayName || 'Thám hiểm nhí'}</h2>
                            <div className="px-5 py-2 bg-white rounded-full border border-slate-100 shadow-sm flex items-center gap-2">
                                <span className="text-sunshineYellow text-sm">✨</span>
                                <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest leading-none translate-y-[1px]">
                                    {profile?.level_name || `${displayXP} Sao thông thái`}
                                </span>
                            </div>
                        </div>

                        {/* Summary Stats Grid - Gamified Dashboard Style */}
                        <div className="grid grid-cols-3 gap-4 mb-10">
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

                        {/* Recent Captures Row */}
                        {recentCaptures.length > 0 && (
                            <section className="mb-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-black text-deepNavy uppercase tracking-wider flex items-center gap-2">
                                        📸 Mới thu thập
                                    </h3>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 no-scrollbar">
                                    {recentCaptures.map(word => (
                                        <motion.div
                                            key={word.id}
                                            whileTap={{ scale: 0.95 }}
                                            className="min-w-[110px] aspect-[3/4] bg-slate-100 rounded-[24px] shadow-level-1 border-2 border-white overflow-hidden relative group"
                                        >
                                            {word.image ? (
                                                <img
                                                    src={word.image}
                                                    alt={word.word_en}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/icon-box.png';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-skyBlue/5 text-3xl">📸</div>
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 pt-6">
                                                <p className="text-[10px] font-black text-white truncate uppercase tracking-wider">{word.word_en}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Language Garden - Category Progress */}
                        <section className="bg-white/80 backdrop-blur-md rounded-[40px] p-8 border-2 border-white shadow-level-2 mb-10">
                            <h3 className="text-base font-black text-deepNavy mb-6 flex items-center gap-3">
                                <span className="text-xl">🌿</span> Khu vườn ngôn ngữ
                            </h3>
                            <div className="space-y-6">
                                {categoryStats.length > 0 ? categoryStats.slice(0, 4).map(stat => (
                                    <div key={stat.id} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{stat.icon}</span>
                                                <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{stat.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-skyBlue">{stat.count} thẻ</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((stat.count / 15) * 100, 100)}%` }}
                                                className="h-full bg-gradient-to-r from-skyBlue to-mintGreen rounded-full"
                                            />
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-center text-xs text-slate-400 font-bold py-4">Chụp ảnh để bắt đầu khu vườn nhé! 🌸</p>
                                )}
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
                    </div>

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
                                        <span className="text-3xl font-black text-sky-500 tracking-widest">
                                            {gateChallenge?.question || '7 + 8 = ?'}
                                        </span>
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="Kết quả là..."
                                        value={gateAnswer}
                                        onChange={(e) => { setGateAnswer(e.target.value); setGateError(''); }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyGate()}
                                        className="w-full bg-slate-100 rounded-2xl py-5 px-6 text-center text-2xl font-black text-deepNavy focus:outline-none focus:ring-4 focus:ring-sky-200 mb-4"
                                    />
                                    {gateError && (
                                        <p className="text-coralRed font-bold text-sm mb-4">{gateError}</p>
                                    )}
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => { playPop(); setShowParentGate(false); }}
                                            className="flex-1 py-4 font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleVerifyGate}
                                            disabled={isVerifying}
                                            className="flex-1 bg-sky-500 text-white py-4 rounded-2xl font-black shadow-[0_6px_0_rgba(14,165,233,0.3)] disabled:opacity-70"
                                        >
                                            {isVerifying ? 'Đang kiểm...' : 'OK'}
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
