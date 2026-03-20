import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Crown, Timer } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

interface LeaderboardScreenProps {
    isOpen: boolean;
    onClose: () => void;
}

const mockPlayers = [
    { id: '1', name: 'An Nguyen', points: 2450, avatar: '🦊', rank: 1 },
    { id: '2', name: 'Minh Tu', points: 1980, avatar: '🦁', rank: 2 },
    { id: '3', name: 'Bao Bao', points: 1650, avatar: '🐼', rank: 3 },
    { id: '4', name: 'Linh Chi', points: 1200, avatar: '🐰', rank: 4 },
    { id: '5', name: 'Hung Vuong', points: 980, avatar: '🐯', rank: 5 },
    { id: '6', name: 'Thao My', points: 840, avatar: '🐨', rank: 6 },
    { id: '7', name: 'Dung Beo', points: 720, avatar: '🐷', rank: 7 },
    { id: '8', name: 'Ngoc Anh', points: 650, avatar: '🦄', rank: 8 },
];

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ isOpen, onClose }) => {
    const { xp, level } = useGameStore();
    const [activeTab, setActiveTab] = useState('All');

    const top3 = mockPlayers.slice(0, 3);
    const others = mockPlayers.slice(3);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[150] bg-snowWhite flex flex-col font-outfit"
                >
                    {/* Header */}
                    <header className="px-6 pt-12 pb-6 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-sunshineYellow rounded-xl">
                                    <Trophy className="w-6 h-6 text-deepNavy" />
                                </div>
                                <h1 className="text-2xl font-black text-deepNavy uppercase tracking-tight">Leaderboard</h1>
                            </div>
                            <button onClick={onClose} className="p-2 -mr-2">
                                <X className="w-8 h-8 text-deepNavy" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl relative">
                            {['Class', 'Friends', 'All'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-all relative z-10 ${activeTab === tab ? 'text-deepNavy' : 'text-slate-400'
                                        }`}
                                >
                                    {tab}
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
                    </header>

                    <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24">
                        {/* Countdown Timer */}
                        <div className="flex items-center justify-center gap-2 mb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 py-2 rounded-full border border-slate-100">
                            <Timer className="w-3 h-3" />
                            Season resets in: 12 days 14 hours
                        </div>

                        {/* Podium Section */}
                        <div className="flex items-end justify-center gap-2 mb-10 h-64 border-b-2 border-slate-50 pb-4">
                            {/* #2 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                className="flex-1 flex flex-col items-center"
                            >
                                <div className="text-4xl mb-2 relative">
                                    <span className="relative z-10">{top3[1].avatar}</span>
                                    <div className="absolute -top-1 -right-1 bg-slate-300 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white text-[10px] font-black text-white">2</div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-t-2xl shadow-sm p-3 text-center border-t-4 border-slate-300 h-28 flex flex-col justify-end">
                                    <span className="block font-black text-xs text-deepNavy truncate">{top3[1].name}</span>
                                    <span className="block font-bold text-[10px] text-skyBlue">{top3[1].points} XP</span>
                                </div>
                            </motion.div>

                            {/* #1 */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}
                                className="flex-1 flex flex-col items-center -mb-4"
                            >
                                <div className="relative mb-3">
                                    <Crown className="w-10 h-10 text-sunshineYellow absolute -top-8 left-1/2 -translate-x-1/2 fill-sunshineYellow rotate-12 drop-shadow-sm" />
                                    <div className="text-6xl relative z-10">{top3[0].avatar}</div>
                                </div>
                                <div className="w-full bg-sunshineYellow rounded-t-3xl shadow-level-2 p-3 text-center border-t-8 border-yellow-500 h-44 flex flex-col justify-end">
                                    <span className="block font-black text-sm text-deepNavy truncate">{top3[0].name}</span>
                                    <span className="block font-bold text-xs text-slate-700">{top3[0].points} XP</span>
                                </div>
                            </motion.div>

                            {/* #3 */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="flex-1 flex flex-col items-center"
                            >
                                <div className="text-4xl mb-2 relative">
                                    <span className="relative z-10">{top3[2].avatar}</span>
                                    <div className="absolute -top-1 -right-1 bg-amber-600 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white text-[10px] font-black text-white">3</div>
                                </div>
                                <div className="w-full bg-amber-50 rounded-t-2xl shadow-sm p-3 text-center border-t-4 border-amber-400 h-20 flex flex-col justify-end">
                                    <span className="block font-black text-xs text-deepNavy truncate">{top3[2].name}</span>
                                    <span className="block font-bold text-[10px] text-amber-600">{top3[2].points} XP</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Others List */}
                        <div className="space-y-4">
                            {others.map((player, idx) => (
                                <motion.div
                                    key={player.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * idx }}
                                    className="bg-white p-4 rounded-[20px] shadow-sm flex items-center justify-between border-b-2 border-slate-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="w-6 text-sm font-black text-slate-400">{player.rank}</span>
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl shadow-sm border-2 border-white">
                                            {player.avatar}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-deepNavy text-sm">{player.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Vocab Hunter</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-skyBlue text-sm">⭐ {player.points}</p>
                                        <p className="text-[9px] font-bold text-slate-300 uppercase">Points</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Footer / User Stick Position */}
                    <div className="bg-white/80 backdrop-blur-xl border-t border-slate-100 p-4 absolute bottom-0 left-0 right-0 z-50">
                        <div className="max-w-md mx-auto bg-deepNavy rounded-[24px] p-5 flex items-center justify-between shadow-level-3">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-skyBlue rounded-full flex items-center justify-center text-xl text-white font-black border-2 border-white/20">
                                    12
                                </div>
                                <div>
                                    <h4 className="font-black text-white text-sm">YOU (Dat Nguyen)</h4>
                                    <p className="text-[10px] font-bold text-sky-100 uppercase tracking-widest opacity-70">Level {level}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-sunshineYellow text-lg">{xp}</p>
                                <p className="text-[10px] font-bold text-sky-100 uppercase opacity-70">XP</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LeaderboardScreen;
