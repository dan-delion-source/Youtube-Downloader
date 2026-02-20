'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Eye, User, FileVideo } from 'lucide-react';
import { MediaData } from '@/types';
import Image from 'next/image';

interface ThumbnailPreviewProps {
    data: MediaData;
}

export default function ThumbnailPreview({ data }: ThumbnailPreviewProps) {
    const [imgError, setImgError] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl overflow-hidden border-gradient"
        >
            <div className="glass-stronger rounded-2xl overflow-hidden">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                    {!imgError && data.thumbnail ? (
                        <Image
                            src={data.thumbnail}
                            alt={data.title}
                            fill
                            className="object-cover"
                            unoptimized
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/40">
                            <FileVideo className="w-12 h-12 text-purple-400/60 mb-2" />
                            <span className="text-slate-500 text-xs">No preview available</span>
                        </div>
                    )}
                    {/* Duration badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/80 text-white text-xs font-mono font-semibold backdrop-blur-sm">
                        {data.duration}
                    </div>
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Info */}
                <div className="p-4 sm:p-5">
                    <h2 className="text-white font-semibold text-sm sm:text-base leading-snug mb-3 line-clamp-2">
                        {data.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-purple-400" />
                            {data.channel}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Eye className="w-3 h-3 text-blue-400" />
                            {data.views} views
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-pink-400" />
                            {data.duration}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
