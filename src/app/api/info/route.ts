import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { ensureYtdlp } from '@/lib/ytdlp';

const execFileAsync = promisify(execFile);

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');
    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        const ytdlpPath = await ensureYtdlp();
        console.log('[api/info] using yt-dlp at:', ytdlpPath);

        const { stdout } = await execFileAsync(ytdlpPath, [
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

            // Note: Vercel does not have ffmpeg. If the format has no audio (acodec === 'none'), 
            // yt-dlp needs ffmpeg to merge it with an audio stream.
            // When running on Vercel, we must skip video-only formats and only allow pre-merged formats.
            if (process.env.VERCEL === '1' && f.acodec === 'none') continue;

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
    } catch (err: any) {
        console.error('[api/info] error:', err);
        return NextResponse.json(
            {
                error: 'Failed to fetch video info. Make sure the URL is valid.',
                details: err?.message || String(err)
            },
            { status: 500 }
        );
    }
}
