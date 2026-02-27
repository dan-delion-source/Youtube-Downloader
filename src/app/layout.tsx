import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    display: 'swap',
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: 'MediaHub — Premium Media Downloader',
    description: 'Paste a media URL and instantly get MP4 or MP3 download options. Supports YouTube Content Only',
    keywords: ['media downloader', 'youtube downloader', 'mp4', 'mp3', 'video download'],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`dark ${inter.variable}`}>
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
