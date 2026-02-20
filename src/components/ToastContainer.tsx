'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { Toast } from '@/types';

interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}

const icons = {
    success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    error: <XCircle className="w-4 h-4 text-red-400" />,
    info: <Info className="w-4 h-4 text-blue-400" />,
};

const borders = {
    success: 'border-emerald-500/30',
    error: 'border-red-500/30',
    info: 'border-blue-500/30',
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    useEffect(() => {
        const t = setTimeout(() => onDismiss(toast.id), 3500);
        return () => clearTimeout(t);
    }, [toast.id, onDismiss]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            role="alert"
            className={`flex items-start gap-3 px-4 py-3.5 rounded-xl glass-stronger border ${borders[toast.type]} min-w-[260px] max-w-sm shadow-2xl`}
        >
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <p className="text-sm text-slate-200 flex-1 leading-snug">{toast.message}</p>
            <button
                onClick={() => onDismiss(toast.id)}
                className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Dismiss notification"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 sm:top-6 sm:right-6">
            <AnimatePresence mode="popLayout">
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
                ))}
            </AnimatePresence>
        </div>
    );
}
