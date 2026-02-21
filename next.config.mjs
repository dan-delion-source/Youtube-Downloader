/** @type {import('next').NextConfig} */
const nextConfig = {
    // Allow images from YouTube and other sources
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'img.youtube.com' },
            { protocol: 'https', hostname: 'i.ytimg.com' },
            { protocol: 'https', hostname: 'vi.ytimg.com' },
            { protocol: 'https', hostname: 'yt3.ggpht.com' },
            { protocol: 'https', hostname: 'yt3.googleusercontent.com' },
            { protocol: 'https', hostname: 'picsum.photos' },
        ],
    },

    // Bundle the yt-dlp binary with all API functions on Vercel
    outputFileTracingIncludes: {
        '/api/**': ['./bin/yt-dlp'],
    },
};

export default nextConfig;
