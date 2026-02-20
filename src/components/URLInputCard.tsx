'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Sparkles, AlertCircle } from 'lucide-react';

interface URLInputCardProps {
    onSubmit: (url: string) => void;
    isLoading: boolean;
}

export default function URLInputCard({ onSubmit, isLoading }: URLInputCardProps) {
    const [url, setUrl] = useState('');
    const [focused, setFocused] = useState(false);
    const [error, setError] = useState('');

    const validateUrl = (u: string) => {
        try {
            const parsed = new URL(u);
            const validHosts = ['youtube.com', 'www.youtube.com', 'youtu.be', 'vimeo.com', 'www.vimeo.com', 'twitter.com', 'x.com', 'instagram.com'];
            return validHosts.some(h => parsed.hostname === h || parsed.hostname.endsWith('.' + h));
        } catch {
            return false;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) {
            setError('Please enter a URL');
            return;
        }
        if (!validateUrl(url)) {
            setError('Please enter a valid YouTube, Vimeo, Twitter, or Instagram URL');
            return;
        }
        setError('');
        onSubmit(url.trim());
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl mx-auto"
        >
            {/* Hero text */}
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-purple-500/20 mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-purple-300 font-medium tracking-wide">Premium Media Downloader</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 leading-tight">
                    <span className="text-gradient">Download</span>
                    <br />
                    <span className="text-white">anything,&nbsp;</span>
                    <span className="text-slate-400">anywhere</span>
                </h1>
                <p className="text-slate-400 text-base sm:text-lg max-w-md mx-auto">
                    Paste a media URL and instantly get MP4 or MP3 download options.
                </p>
            </motion.div>

            {/* Input card */}
            <motion.div
                className="relative rounded-2xl p-1"
                style={{
                    background: focused
                        ? 'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(59,130,246,0.6))'
                        : 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(59,130,246,0.2))',
                    transition: 'background 0.3s ease',
                }}
                whileHover={{ scale: 1.005 }}
                transition={{ duration: 0.2 }}
            >
                <div className="glass-stronger rounded-xl p-5 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* URL Input */}
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                <Link2 className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setFocused(false)}
                                placeholder="Paste your media URL here…"
                                disabled={isLoading}
                                className="w-full pl-10 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm sm:text-base font-medium focus:border-purple-500/60 focus:bg-white/8 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="flex items-center gap-2 text-red-400 text-sm"
                                >
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            className="relative w-full py-4 rounded-xl font-semibold text-white text-sm sm:text-base overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                                background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #7c3aed 100%)',
                                backgroundSize: '200% auto',
                            }}
                            whileHover={{ scale: 1.01, backgroundPosition: 'right center' }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                        >
                            <motion.div
                                className="absolute inset-0 opacity-0"
                                style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 60%)' }}
                                whileTap={{ opacity: 1 }}
                                transition={{ duration: 0.1 }}
                            />
                            <span className="relative flex items-center justify-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                {isLoading ? 'Processing…' : 'Generate Download Links'}
                            </span>
                        </motion.button>
                    </form>
                </div>
            </motion.div>

            {/* Supported platforms */}
            <motion.p
                className="text-center text-xs text-slate-600 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                Supports YouTube · Vimeo · Twitter / X · Instagram
            </motion.p>
        </motion.div>
    );
}
