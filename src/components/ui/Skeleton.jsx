import React from 'react';

/* ── Base Skeleton Pulse ─────────────────────────── */
const Skeleton = ({ className = '', style = {} }) => (
    <div
        className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
        style={style}
    />
);

/* ── Skeleton Text Line ──────────────────────────── */
export const SkeletonText = ({ width = '100%', height = '0.75rem', className = '' }) => (
    <Skeleton className={className} style={{ width, height }} />
);

/* ── Skeleton Circle (avatar) ────────────────────── */
export const SkeletonCircle = ({ size = 40, className = '' }) => (
    <Skeleton className={`rounded-full shrink-0 ${className}`} style={{ width: size, height: size }} />
);

/* ── Stats Card Skeleton ─────────────────────────── */
export const StatsCardSkeleton = () => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
            <Skeleton className="rounded-xl" style={{ width: 44, height: 44 }} />
            <SkeletonText width="4rem" height="0.6rem" />
        </div>
        <SkeletonText width="60%" height="1.5rem" />
        <SkeletonText width="40%" height="0.6rem" />
    </div>
);

/* ── Table Row Skeleton ──────────────────────────── */
export const TableRowSkeleton = ({ cols = 5 }) => (
    <tr>
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="py-4 px-2">
                <SkeletonText
                    width={i === 0 ? '70%' : i === cols - 1 ? '3rem' : '50%'}
                    height="0.7rem"
                />
            </td>
        ))}
    </tr>
);

/* ── Table Skeleton (multiple rows) ──────────────── */
export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
    <>
        {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
        ))}
    </>
);

/* ── Dashboard Skeleton ──────────────────────────── */
export const DashboardSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
            ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <SkeletonText width="40%" height="1rem" />
                <Skeleton style={{ width: '100%', height: 200 }} className="rounded-xl" />
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <SkeletonText width="35%" height="1rem" />
                <Skeleton style={{ width: '100%', height: 200 }} className="rounded-xl" />
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <SkeletonText width="30%" height="1rem" className="mb-6" />
            <table className="w-full">
                <tbody>
                    <TableSkeleton rows={4} cols={6} />
                </tbody>
            </table>
        </div>
    </div>
);

/* ── Product Grid Skeleton ───────────────────────── */
export const ProductGridSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <Skeleton style={{ width: '100%', height: 160 }} className="rounded-none" />
                <div className="p-4 space-y-2">
                    <SkeletonText width="70%" height="0.8rem" />
                    <SkeletonText width="40%" height="1rem" />
                    <SkeletonText width="50%" height="0.6rem" />
                </div>
            </div>
        ))}
    </div>
);

/* ── Page-level Table Skeleton (full card) ────────── */
export const PageTableSkeleton = ({ cols = 5, rows = 6 }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-100">
                        {Array.from({ length: cols }).map((_, i) => (
                            <th key={i} className="pb-4 pt-2">
                                <SkeletonText width={i === 0 ? '5rem' : '4rem'} height="0.5rem" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="animate-pulse">
                    <TableSkeleton rows={rows} cols={cols} />
                </tbody>
            </table>
        </div>
    </div>
);

export default Skeleton;
