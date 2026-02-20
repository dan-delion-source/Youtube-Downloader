'use client';

import { motion } from 'framer-motion';
import { Video } from 'lucide-react';
import DownloadItem from './DownloadItem';
import { VideoFormat } from '@/types';

interface VideoDownloadPanelProps {
    formats: VideoFormat[];
    onDownload: (formatId: string, label: string) => void;
}

// Fallback options shown before real data loads
const FALLBACK_OPTIONS: VideoFormat[] = [
    { formatId: 'best', label: 'Best', resolution: 'best', ext: 'mp4', filesize: null },
];

function formatFilesize(bytes: number | null): string {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `~${Math.round(bytes / 1024)} KB`;
    return `~${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function VideoDownloadPanel({ formats, onDownload }: VideoDownloadPanelProps) {
    const options = formats.length ? formats : FALLBACK_OPTIONS;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="relative rounded-2xl border-gradient overflow-hidden"
        >
            <div className="glass-stronger rounded-2xl p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30">
                        <Video className="w-4.5 h-4.5 text-purple-400" style={{ width: '18px', height: '18px' }} />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">Download Video</h3>
                        <p className="text-slate-500 text-xs">MP4 format</p>
                    </div>
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/20">
                        MP4
                    </span>
                </div>

                {/* Items */}
                <motion.div
                    className="space-y-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {options.map((opt) => (
                        <motion.div key={opt.formatId} variants={itemVariants}>
                            <DownloadItem
                                label={opt.label}
                                sublabel={opt.resolution}
                                size={formatFilesize(opt.filesize)}
                                accentColor="purple"
                                onDownload={() => onDownload(opt.formatId, opt.label)}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
}
