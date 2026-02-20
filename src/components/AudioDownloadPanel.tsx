'use client';

import { motion } from 'framer-motion';
import { Music } from 'lucide-react';
import DownloadItem from './DownloadItem';

interface AudioDownloadPanelProps {
    onDownload: (quality: string) => void;
}

const AUDIO_OPTIONS = [
    { label: 'Best Quality', sublabel: 'MP3 · VBR 0', id: 'best' },
    { label: '320 kbps', sublabel: 'MP3 · High', id: '320' },
    { label: '192 kbps', sublabel: 'MP3 · Good', id: '192' },
    { label: '128 kbps', sublabel: 'MP3 · Standard', id: '128' },
];

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

export default function AudioDownloadPanel({ onDownload }: AudioDownloadPanelProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="relative rounded-2xl overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(59,130,246,0.08))',
                border: '1px solid rgba(59,130,246,0.15)',
            }}
        >
            <div className="glass-stronger rounded-2xl p-5" style={{ background: 'rgba(59,130,246,0.03)' }}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30">
                        <Music className="w-4.5 h-4.5 text-blue-400" style={{ width: '18px', height: '18px' }} />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-sm">Download Audio</h3>
                        <p className="text-slate-500 text-xs">MP3 format</p>
                    </div>
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/20">
                        MP3
                    </span>
                </div>

                {/* Items */}
                <motion.div
                    className="space-y-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {AUDIO_OPTIONS.map((opt) => (
                        <motion.div key={opt.id} variants={itemVariants}>
                            <DownloadItem
                                label={opt.label}
                                sublabel={opt.sublabel}
                                size=""
                                accentColor="blue"
                                onDownload={() => onDownload(opt.id)}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
}
