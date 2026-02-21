import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import https from 'https';

const execFileAsync = promisify(execFile);

// Helper to reliably find or download yt-dlp on Vercel
async function ensureYtdlp(): Promise<string> {
    if (process.env.YTDLP_PATH) return process.env.YTDLP_PATH;

    // 1. Check if it exists in the Vercel bundled ./bin directory
    const bundledPath = path.join(process.cwd(), 'bin', 'yt-dlp');
    if (fs.existsSync(bundledPath)) {
        try {
            fs.accessSync(bundledPath, fs.constants.X_OK);
            return bundledPath;
        } catch {
            // It exists but isn't executable? Try to chmod it
            try { fs.chmodSync(bundledPath, 0o755); return bundledPath; } catch { }
        }
    }

    // 2. If missing (common on Vercel if outputFileTracing fails), download it to /tmp
    const tmpPath = '/tmp/yt-dlp';
    if (fs.existsSync(tmpPath)) return tmpPath;

    console.log('[api/info] yt-dlp missing in bundle, downloading to /tmp...');
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(tmpPath);
        https.get('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux', {
            headers: { 'User-Agent': 'mediahub/1.0' }
        }, (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                https.get(res.headers.location!, (res2) => {
                    res2.pipe(file);
                    file.on('finish', () => { file.close(); fs.chmodSync(tmpPath, 0o755); resolve(tmpPath); });
                });
            } else {
                res.pipe(file);
                file.on('finish', () => { file.close(); fs.chmodSync(tmpPath, 0o755); resolve(tmpPath); });
            }
        }).on('error', (err) => {
            fs.unlinkSync(tmpPath);
            reject(err);
        });
    });
}

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
