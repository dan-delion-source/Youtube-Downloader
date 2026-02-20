'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingSpinner() {
    return (
        <AnimatePresence>
            <motion.div
                className="flex flex-col items-center justify-center gap-4 py-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
            >
                <div className="relative">
                    <motion.div
                        className="w-14 h-14 rounded-full border-2 border-transparent"
                        style={{
                            background: 'linear-gradient(135deg, #7c3aed, #3b82f6, #ec4899) border-box',
                            borderImage: 'linear-gradient(135deg, #7c3aed, #3b82f6, #ec4899) 1',
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background:
                                    'conic-gradient(from 0deg, transparent 0%, #7c3aed 30%, #3b82f6 60%, #ec4899 80%, transparent 100%)',
                                maskImage: 'radial-gradient(circle, transparent 60%, black 60%)',
                                WebkitMaskImage: 'radial-gradient(circle, transparent 60%, black 60%)',
                            }}
                        />
                    </motion.div>
                    <div className="absolute inset-2 rounded-full bg-[#0d0d1a]" />
                    <motion.div
                        className="absolute inset-0 rounded-full opacity-50"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{
                            background:
                                'conic-gradient(from 180deg, #7c3aed 0%, #3b82f6 40%, transparent 70%)',
                            maskImage: 'radial-gradient(circle, transparent 55%, black 55%)',
                            WebkitMaskImage: 'radial-gradient(circle, transparent 55%, black 55%)',
                        }}
                    />
                </div>

                <motion.p
                    className="text-sm text-slate-400 font-medium tracking-wide"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    Fetching media info…
                </motion.p>
            </motion.div>
        </AnimatePresence>
    );
}
