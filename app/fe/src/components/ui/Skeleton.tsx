import React from 'react';

/**
 * Shimmer skeleton components for loading states.
 * Child-friendly, rounded, with gentle animation.
 */

const shimmerClass = 'animate-pulse bg-slate-100 rounded-2xl';

export const SkeletonBox: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`${shimmerClass} ${className}`} />
);

export const SkeletonCircle: React.FC<{ size?: string }> = ({ size = 'w-12 h-12' }) => (
    <div className={`animate-pulse bg-slate-100 rounded-full ${size}`} />
);

export const SkeletonText: React.FC<{ width?: string }> = ({ width = 'w-24' }) => (
    <div className={`animate-pulse bg-slate-100 rounded-full h-4 ${width}`} />
);

/** Category grid skeleton for CollectionBook */
export const CollectionSkeleton: React.FC = () => (
    <div className="grid grid-cols-2 gap-5 pb-20">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-[32px] p-5 shadow-level-2 border-b-[6px] border-slate-100 flex flex-col items-center">
                <SkeletonCircle size="w-24 h-24" />
                <SkeletonText width="w-20 mt-4" />
                <SkeletonBox className="w-full h-3 mt-3" />
            </div>
        ))}
    </div>
);

/** Quest list skeleton for QuestScreen */
export const QuestSkeleton: React.FC = () => (
    <div className="space-y-5">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-[32px] p-6 bg-white shadow-level-2 border-b-8 border-slate-100 space-y-4">
                <SkeletonText width="w-40" />
                <SkeletonText width="w-56" />
                <SkeletonBox className="w-full h-4" />
            </div>
        ))}
    </div>
);

/** Podium + list skeleton for LeaderboardScreen */
export const LeaderboardSkeleton: React.FC = () => (
    <div className="space-y-6">
        {/* Podium */}
        <div className="flex items-end justify-center gap-2 h-64 pb-4">
            <div className="flex-1 flex flex-col items-center">
                <SkeletonCircle size="w-14 h-14" />
                <SkeletonBox className="w-full h-28 mt-2" />
            </div>
            <div className="flex-1 flex flex-col items-center -mb-4">
                <SkeletonCircle size="w-20 h-20" />
                <SkeletonBox className="w-full h-44 mt-2" />
            </div>
            <div className="flex-1 flex flex-col items-center">
                <SkeletonCircle size="w-14 h-14" />
                <SkeletonBox className="w-full h-20 mt-2" />
            </div>
        </div>
        {/* List */}
        {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-[20px] shadow-sm flex items-center gap-4 border-b-2 border-slate-50">
                <SkeletonCircle size="w-8 h-8" />
                <SkeletonCircle />
                <div className="flex-1 space-y-2">
                    <SkeletonText width="w-24" />
                </div>
                <SkeletonText width="w-12" />
            </div>
        ))}
    </div>
);

/** Profile skeleton for ProfileScreen */
export const ProfileSkeleton: React.FC = () => (
    <div className="flex flex-col items-center">
        <SkeletonCircle size="w-32 h-32 mb-4" />
        <SkeletonText width="w-32 mb-2" />
        <SkeletonText width="w-24 mb-10" />
        <div className="grid grid-cols-3 gap-4 w-full mb-10">
            {[...Array(3)].map((_, i) => (
                <SkeletonBox key={i} className="h-24" />
            ))}
        </div>
        <div className="grid grid-cols-3 gap-6 w-full">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                    <SkeletonBox className="w-20 h-20 rounded-3xl" />
                    <SkeletonText width="w-14 mt-2" />
                </div>
            ))}
        </div>
    </div>
);
