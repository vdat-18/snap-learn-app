import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Timer, Loader2 } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { leaderboardApi, type LeaderboardResponse } from '../../services/leaderboardApi';
import { LeaderboardSkeleton } from './Skeleton';

interface LeaderboardScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

// Avatar ID to emoji mapping
const avatarEmoji = (id: string): string => {
    const map: Record<string, string> = {
        owl: '🦉', rabbit: '🐰', cat: '🐱', bear: '🐻', fox: '🦊', panda: '🐼',
        dog: '🐶', tiger: '🐯', lion: '🦁', koala: '🐨',
    };
    return map[id] || '🐾';
};

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ isOpen, onClose }) => {
    const { xp, level, userName } = useGameStore();
    const { playPop } = useSoundEffects();
    const [activeTab, setActiveTab] = useState('global');
    const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(false);

    const loadLeaderboard = (scope: string) => {
        setIsLoading(true);
        setFetchError(false);
        leaderboardApi.getLeaderboard(scope)
            .then(data => setLeaderboard(data))
            .catch(() => setFetchError(true))
            .finally(() => setIsLoading(false));
    };

    // Fetch leaderboard when tab changes or screen opens
    useEffect(() => {
        if (isOpen) {
            loadLeaderboard(activeTab);
        }
    }, [isOpen, activeTab]);

    const entries = leaderboard?.entries || [];
    const top3 = entries.slice(0, 3);
    const others = entries.slice(3);

    // Calculate reset countdown
    const getResetCountdown = () => {
        if (!leaderboard?.reset_date) return '-- ngày';
        const resetDate = new Date(leaderboard.reset_date);
        const now = new Date();
        const diff = Math.max(0, Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        return `${diff} ngày`;
    };

    const tabMap: Record<string, string> = {
        'class': '🏫 Lớp mình',
        'friends': '👫 Bạn bè',
        'global': '🌍 Thế giới',
    };

    // Calculate dynamic rank for current user
    const userRank = [...entries, { name: userName, points: xp }]
        .sort((a, b) => b.points - a.points)
        .findIndex(p => p.name === userName) + 1;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[150] bg-snowWhite flex flex-col font-sans"
                >
                    {/* Header */}
                    <header className="px-6 pt-12 pb-6 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <button onClick={() => { playPop(); onClose(); }} className="w-12 h-12 bg-white rounded-2xl shadow-level-2 flex items-center justify-center border-t-2 border-white/40">
                                <X className="w-8 h-8 text-deepNavy" />
                            </button>
                            <h1 className="text-lg font-black text-deepNavy tracking-tight flex items-center gap-3">
                                👑 Siêu nhân Snap
                            </h1>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto px-6 pt-6 pb-72">
                        {/* Tabs */}
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl relative mb-8">
                            {['class', 'friends', 'global'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => { playPop(); setActiveTab(tab); }}
                                    className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all relative z-10 ${activeTab === tab ? 'text-deepNavy' : 'text-slate-400'}`}
                                >
                                    {tabMap[tab]}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Countdown Timer */}
                        <div className="flex items-center justify-center gap-2 mb-8 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 py-2 rounded-full border border-slate-100">
                            <Timer className="w-3 h-3" />
                            ⏳ Sắp có nhà vô địch mới trong: {getResetCountdown()}
                        </div>

                        {isLoading && (
                            <LeaderboardSkeleton />
                        )}

                        {fetchError && !isLoading && (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <span className="text-5xl">😴</span>
                                <p className="text-base font-black text-deepNavy">Ối! Không tải được bảng xếp hạng</p>
                                <p className="text-sm text-slate-400 font-bold">Kiểm tra kết nối mạng rồi thử lại nhé!</p>
                                <button onClick={() => loadLeaderboard(activeTab)} className="bg-skyBlue text-white px-6 py-3 rounded-2xl font-black text-sm shadow-level-2">
                                    🔄 Thử lại
                                </button>
                            </div>
                        )}

                        {!isLoading && !fetchError && top3.length > 0 && (
                            <>
                                {/* Podium Section */}
                                <div className="flex items-end justify-center gap-2 mb-10 h-64 border-b-2 border-slate-50 pb-4">
                                    {/* #2 */}
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                        className="flex-1 flex flex-col items-center relative"
                                    >
                                        <div className={`text-4xl mb-2 relative ${top3[1]?.name === userName ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,214,52,0.8)]' : ''}`}>
                                            <span className="relative z-10">{top3[1] ? avatarEmoji(top3[1].avatar_id) : '👤'}</span>
                                            <div className="absolute -top-1 -right-1 text-xl">🥈</div>
                                        </div>
                                        <div className={`w-full ${top3[1]?.name === userName ? 'bg-sunshineYellow/20 border-sunshineYellow ring-1 ring-sunshineYellow/50' : 'bg-slate-100 border-slate-300'} rounded-t-2xl shadow-sm p-3 text-center border-t-4 h-28 flex flex-col justify-end transition-colors`}>
                                            <span className="block font-black text-xs text-deepNavy truncate">{top3[1]?.name === userName ? 'BẠN' : top3[1]?.name || '---'}</span>
                                            <span className="block font-bold text-[10px] text-skyBlue">{top3[1]?.points || 0} XP</span>
                                        </div>
                                    </motion.div>

                                    {/* #1 */}
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}
                                        className="flex-1 flex flex-col items-center -mb-4 relative"
                                    >
                                        <div className={`relative mb-3 ${top3[0]?.name === userName ? 'scale-110 drop-shadow-[0_0_15px_rgba(255,214,52,1)]' : ''}`}>
                                            <Crown className="w-10 h-10 text-sunshineYellow absolute -top-8 left-1/2 -translate-x-1/2 fill-sunshineYellow rotate-12 drop-shadow-sm" />
                                            <div className="text-6xl relative z-10">{top3[0] ? avatarEmoji(top3[0].avatar_id) : '👤'}</div>
                                        </div>
                                        <div className={`w-full ${top3[0]?.name === userName ? 'bg-sunshineYellow ring-2 ring-orange-400' : 'bg-sunshineYellow'} rounded-t-3xl shadow-level-2 p-3 text-center border-t-8 border-yellow-500 h-44 flex flex-col justify-end transition-colors`}>
                                            <span className="block font-black text-xs text-deepNavy truncate">{top3[0]?.name === userName ? 'BẠN' : top3[0]?.name || '---'}</span>
                                            <span className="block font-bold text-xs text-slate-700">{top3[0]?.points || 0} XP</span>
                                        </div>
                                    </motion.div>

                                    {/* #3 */}
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                        className="flex-1 flex flex-col items-center relative"
                                    >
                                        <div className={`text-4xl mb-2 relative ${top3[2]?.name === userName ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,214,52,0.8)]' : ''}`}>
                                            <span className="relative z-10">{top3[2] ? avatarEmoji(top3[2].avatar_id) : '👤'}</span>
                                            <div className="absolute -top-1 -right-1 text-xl">🥉</div>
                                        </div>
                                        <div className={`w-full ${top3[2]?.name === userName ? 'bg-sunshineYellow/20 border-sunshineYellow ring-1 ring-sunshineYellow/50' : 'bg-amber-50 border-amber-400'} rounded-t-2xl shadow-sm p-3 text-center border-t-4 h-20 flex flex-col justify-end transition-colors`}>
                                            <span className="block font-black text-xs text-deepNavy truncate">{top3[2]?.name === userName ? 'BẠN' : top3[2]?.name || '---'}</span>
                                            <span className="block font-bold text-[10px] text-amber-600">{top3[2]?.points || 0} XP</span>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Others List */}
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {others.map((player, idx) => {
                                            const isMe = player.name === userName;
                                            return (
                                                <motion.div
                                                    layout
                                                    key={player.child_id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 * idx, type: 'spring', bounce: 0.4 }}
                                                    className={`p-4 rounded-[20px] flex items-center justify-between border-b-2 ${
                                                        isMe
                                                        ? 'bg-sunshineYellow/10 border-sunshineYellow/30 shadow-[0_0_15px_rgba(255,214,52,0.2)] ring-1 ring-sunshineYellow/50'
                                                        : 'bg-white border-slate-50 shadow-sm'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-2xl font-black w-8 text-center ${isMe ? 'text-sunshineYellow' : 'text-slate-400'}`}>
                                                            {player.rank}
                                                        </span>
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm border-2 ${isMe ? 'bg-white border-sunshineYellow' : 'bg-slate-100 border-white'}`}>
                                                            {avatarEmoji(player.avatar_id)}
                                                        </div>
                                                        <div>
                                                            <h4 className={`font-black text-xs ${isMe ? 'text-deepNavy' : 'text-deepNavy'}`}>
                                                                {player.name} {isMe && '(Bạn)'}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`font-black text-xs ${isMe ? 'text-orange-500' : 'text-skyBlue'}`}>⭐ {player.points}</p>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer — User Rank */}
                    <div className="bg-white/80 backdrop-blur-xl border-t border-slate-100 p-4 absolute bottom-0 left-0 right-0 z-50">
                        <div className="max-w-md mx-auto bg-deepNavy rounded-[24px] p-5 flex items-center justify-between shadow-level-3">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-skyBlue rounded-full flex items-center justify-center text-xl text-white font-black border-2 border-white/20">
                                    {leaderboard?.my_rank || level}
                                </div>
                                <div>
                                    <h4 className="font-black text-white text-xs">BẠN ({userName})</h4>
                                    {leaderboard?.my_rank && (
                                        <p className="text-white/50 text-[10px] font-bold">Hạng #{leaderboard.my_rank}</p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-sunshineYellow text-base">⭐ {leaderboard?.my_score || xp}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LeaderboardScreen;
