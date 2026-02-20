'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ParticleBackground() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Large blob 1 */}
            <motion.div
                className="absolute rounded-full opacity-20"
                style={{
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(124,58,237,0.8) 0%, rgba(124,58,237,0) 70%)',
                    top: '-200px',
                    left: '-200px',
                    filter: 'blur(60px)',
                }}
                animate={{
                    x: [0, 80, -30, 0],
                    y: [0, -60, 40, 0],
                    scale: [1, 1.1, 0.95, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                }}
            />

            {/* Large blob 2 */}
            <motion.div
                className="absolute rounded-full opacity-15"
                style={{
                    width: '700px',
                    height: '700px',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(59,130,246,0) 70%)',
                    bottom: '-250px',
                    right: '-200px',
                    filter: 'blur(80px)',
                }}
                animate={{
                    x: [0, -60, 40, 0],
                    y: [0, 50, -40, 0],
                    scale: [1, 0.9, 1.1, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                    delay: 2,
                }}
            />

            {/* Small accent blob */}
            <motion.div
                className="absolute rounded-full opacity-25"
                style={{
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(236,72,153,0.7) 0%, rgba(236,72,153,0) 70%)',
                    top: '40%',
                    left: '60%',
                    filter: 'blur(50px)',
                }}
                animate={{
                    x: [0, -40, 60, 0],
                    y: [0, 60, -30, 0],
                    scale: [1, 1.2, 0.85, 1],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                    delay: 5,
                }}
            />

            {/* Small floating particle dots */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: `${4 + i * 2}px`,
                        height: `${4 + i * 2}px`,
                        background: i % 2 === 0 ? 'rgba(167,139,250,0.6)' : 'rgba(96,165,250,0.6)',
                        top: `${15 + i * 12}%`,
                        left: `${5 + i * 15}%`,
                        filter: 'blur(1px)',
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.8,
                    }}
                />
            ))}
        </div>
    );
}
