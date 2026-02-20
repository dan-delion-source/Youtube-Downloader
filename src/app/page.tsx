'use client';

import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ParticleBackground from '@/components/ParticleBackground';
import URLInputCard from '@/components/URLInputCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ThumbnailPreview from '@/components/ThumbnailPreview';
import VideoDownloadPanel from '@/components/VideoDownloadPanel';
import AudioDownloadPanel from '@/components/AudioDownloadPanel';
import ToastContainer from '@/components/ToastContainer';
import { MediaData, Toast } from '@/types';

export default function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [mediaData, setMediaData] = useState<MediaData | null>(null);
    const [currentUrl, setCurrentUrl] = useState<string>('');
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: Toast['type'], message: string) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { id, type, message }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const handleSubmit = async (url: string) => {
        setIsLoading(true);
        setMediaData(null);
        setCurrentUrl(url);
        addToast('info', 'Fetching media information…');

        try {
            const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error ?? 'Unknown error');
            }

            setMediaData(data as MediaData);
            addToast('success', 'Media info loaded successfully!');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch video info.';
            addToast('error', message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVideoDownload = (formatId: string, label: string) => {
        const dlUrl = `/api/download?url=${encodeURIComponent(currentUrl)}&type=video&quality=${encodeURIComponent(formatId)}`;
        window.open(dlUrl, '_blank');
        addToast('info', `Downloading ${label} video…`);
    };

    const handleAudioDownload = (quality: string = 'best') => {
        const dlUrl = `/api/download?url=${encodeURIComponent(currentUrl)}&type=audio&audioQuality=${encodeURIComponent(quality)}`;
        window.open(dlUrl, '_blank');
        const label = quality === 'best' ? 'Best Quality' : `${quality} kbps`;
        addToast('info', `Downloading audio as MP3 (${label})…`);
    };

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-start pt-16 pb-20 px-4 sm:px-6">
            <ParticleBackground />
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />

            <div className="relative z-10 w-full max-w-6xl mx-auto">
                {/* URL Input always at top */}
                <URLInputCard onSubmit={handleSubmit} isLoading={isLoading} />

                {/* Loading */}
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            key="spinner"
                            className="mt-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <LoadingSpinner />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results */}
                <AnimatePresence>
                    {mediaData && !isLoading && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mt-10"
                        >
                            {/* Desktop: 3-column grid. Mobile: stacked */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Thumbnail */}
                                <div className="md:col-span-1">
                                    <ThumbnailPreview data={mediaData} />
                                </div>

                                {/* Download panels */}
                                <div className="md:col-span-2 flex flex-col gap-5">
                                    <VideoDownloadPanel
                                        formats={mediaData.videoFormats}
                                        onDownload={handleVideoDownload}
                                    />
                                    <AudioDownloadPanel onDownload={handleAudioDownload} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <motion.footer
                className="relative z-10 mt-auto pt-12 text-center text-xs text-slate-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                MediaHub © 2025 — For legally permitted content only
            </motion.footer>
        </main>
    );
}
