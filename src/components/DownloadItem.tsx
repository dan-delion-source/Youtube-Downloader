'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Check, Loader2 } from 'lucide-react';

interface DownloadItemProps {
    label: string;
    sublabel: string;
    size: string;
    onDownload: () => void;
    accentColor?: 'purple' | 'blue';
}

type DownloadState = 'idle' | 'triggered' | 'done';

export default function DownloadItem({ label, sublabel, size, onDownload, accentColor = 'purple' }: DownloadItemProps) {
    const [state, setState] = useState<DownloadState>('idle');

    const handleClick = () => {
        if (state !== 'idle') return;
        setState('triggered');
        onDownload();
        // Show "downloading" briefly then reset
        setTimeout(() => setState('done'), 1200);
        setTimeout(() => setState('idle'), 3500);
    };

    const gradients = {
        purple: 'from-purple-600 to-purple-800',
        blue: 'from-blue-600 to-blue-800',
    };

    const glows = {
        purple: 'rgba(124,58,237,0.4)',
        blue: 'rgba(59,130,246,0.4)',
    };

    return (
        <motion.div
            className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] group"
            whileHover={{
                y: -2,
                borderColor: 'rgba(255,255,255,0.12)',
                backgroundColor: 'rgba(255,255,255,0.05)',
            }}
            transition={{ duration: 0.2 }}
        >
            {/* Label */}
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                    <span className="text-white font-semibold text-sm">{label}</span>
                    <span className="text-xs text-slate-500">{sublabel}</span>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
                    {state === 'triggered' && (
                        <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${gradients[accentColor]}`}
                            initial={{ width: '0%' }}
                            animate={{ width: '70%' }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                    )}
                    {state === 'done' && (
                        <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${gradients[accentColor]}`}
                            initial={{ width: '70%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 0.3 }}
                        />
                    )}
                </div>
            </div>

            {/* Size */}
            {size && (
                <span className="text-xs text-slate-500 flex-shrink-0 hidden sm:block">{size}</span>
            )}

            {/* Button */}
            <motion.button
                onClick={handleClick}
                disabled={state !== 'idle'}
                className={`relative flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white overflow-hidden transition-all disabled:cursor-not-allowed`}
                style={{
                    background:
                        state === 'done'
                            ? 'linear-gradient(135deg, #059669, #10b981)'
                            : `linear-gradient(135deg, ${accentColor === 'purple' ? '#7c3aed, #5b21b6' : '#2563eb, #1d4ed8'})`,
                    boxShadow: state === 'idle' ? `0 4px 16px ${glows[accentColor]}` : 'none',
                }}
                whileHover={state === 'idle' ? { scale: 1.04, y: -1 } : {}}
                whileTap={state === 'idle' ? { scale: 0.96 } : {}}
                transition={{ duration: 0.15 }}
            >
                {state === 'idle' && (
                    <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                    </>
                )}
                {state === 'triggered' && (
                    <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Starting…</span>
                    </>
                )}
                {state === 'done' && (
                    <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Started!</span>
                    </>
                )}
            </motion.button>
        </motion.div>
    );
}
