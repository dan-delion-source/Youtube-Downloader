import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

// Use YTDLP_PATH env var (local dev pointing to system install),
// otherwise fall back to the binary downloaded into ./bin/ at build time (Vercel).
const YTDLP =
    process.env.YTDLP_PATH ||
    path.join(process.cwd(), 'bin', 'yt-dlp');

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');
    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        const { stdout } = await execFileAsync(YTDLP, [
            '--dump-json',
            '--no-playlist',
            url,
        ], { maxBuffer: 20 * 1024 * 1024 });

        const info = JSON.parse(stdout);

        // Filter formats: get unique height-based video options + audio
        const seenHeights = new Set<number>();
        const videoFormats: { formatId: string; label: string; resolution: string; ext: string; filesize: number | null }[] = [];

        // Sort formats by height descending
        const formats: {
            format_id: string;
            height?: number;
            vcodec?: string;
            acodec?: string;
            ext?: string;
            filesize?: number;
            filesize_approx?: number;
        }[] = (info.formats || []).slice().sort(
            (a: { height?: number }, b: { height?: number }) => (b.height ?? 0) - (a.height ?? 0)
        );

        for (const f of formats) {
            // Only include video-only or combined formats with a known height
            if (!f.height || f.height < 144) continue;
            if (f.vcodec === 'none') continue; // audio-only, skip
            if (seenHeights.has(f.height)) continue;
            seenHeights.add(f.height);

            const labels: Record<number, string> = {
                2160: '4K', 1440: '2K', 1080: '1080p', 720: '720p',
                480: '480p', 360: '360p', 240: '240p', 144: '144p',
            };
            const label = labels[f.height] ?? `${f.height}p`;

            videoFormats.push({
                formatId: f.format_id,
                label,
                resolution: `${f.height}p`,
                ext: f.ext ?? 'mp4',
                filesize: f.filesize ?? f.filesize_approx ?? null,
            });
        }

        // Duration formatting
        const secs = info.duration ?? 0;
        const mm = Math.floor(secs / 60);
        const ss = String(secs % 60).padStart(2, '0');
        const duration = `${mm}:${ss}`;

        // Views formatting
        const views = info.view_count
            ? Intl.NumberFormat('en', { notation: 'compact' }).format(info.view_count)
            : 'N/A';

        return NextResponse.json({
            title: info.title ?? 'Unknown Title',
            thumbnail: info.thumbnail ?? '',
            duration,
            channel: info.channel ?? info.uploader ?? 'Unknown',
            views,
            videoFormats,
        });
    } catch (err) {
        console.error('[api/info] error:', err);
        return NextResponse.json(
            { error: 'Failed to fetch video info. Make sure the URL is valid.' },
            { status: 500 }
        );
    }
}
