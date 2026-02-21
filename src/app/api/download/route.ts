import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import https from 'https';

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

    console.log('[api/download] yt-dlp missing in bundle, downloading to /tmp...');
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

export const maxDuration = 300; // allow up to 5 min streaming (requires Vercel Pro)

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');
    const type = req.nextUrl.searchParams.get('type'); // 'video' | 'audio'
    const quality = req.nextUrl.searchParams.get('quality'); // format_id for video
    const audioQuality = req.nextUrl.searchParams.get('audioQuality') ?? 'best'; // 'best'|'320'|'192'|'128'

    if (!url || !type) {
        return new Response(JSON.stringify({ error: 'Missing url or type' }), { status: 400 });
    }

    const ytdlpPath = await ensureYtdlp();
    const args: string[] = ['--no-playlist', '-o', '-'];

    let filename: string;
    let contentType: string;

    if (type === 'audio') {
        // Map UI quality labels to yt-dlp values
        const qualityMap: Record<string, string> = {
            best: '0',
            '320': '320K',
            '192': '192K',
            '128': '128K',
        };
        const ytQuality = qualityMap[audioQuality] ?? '0';
        // Extract best audio and convert to mp3
        args.push(
            '-f', 'bestaudio',
            '-x',
            '--audio-format', 'mp3',
            '--audio-quality', ytQuality,
        );
        filename = 'audio.mp3';
        contentType = 'audio/mpeg';
    } else {
        // Video: use the given format_id merged with best audio
        const formatStr = quality ? `${quality}+bestaudio/best` : 'bestvideo+bestaudio/best';
        args.push('-f', formatStr, '--merge-output-format', 'mp4');
        filename = 'video.mp4';
        contentType = 'video/mp4';
    }

    args.push(url);

    const proc = spawn(ytdlpPath, args);

    // Convert Node.js stream to Web ReadableStream
    let isClosed = false;
    const readable = new ReadableStream({
        start(controller) {
            proc.stdout.on('data', (chunk: Buffer) => {
                if (isClosed) return;
                try {
                    controller.enqueue(new Uint8Array(chunk));
                } catch (e) {
                    isClosed = true;
                }
            });
            proc.stdout.on('end', () => {
                if (isClosed) return;
                try {
                    controller.close();
                } catch (e) { }
                isClosed = true;
            });
            proc.stderr.on('data', (chunk: Buffer) => {
                // yt-dlp writes progress to stderr — just log it
                // console.log('[yt-dlp stderr]', chunk.toString());
            });
            proc.on('error', (err) => {
                if (isClosed) return;
                try {
                    controller.error(err);
                } catch (e) { }
                isClosed = true;
            });
            proc.on('close', (code) => {
                if (code !== 0) {
                    console.error(`[yt-dlp] exited with code ${code}`);
                }
            });
        },
        cancel() {
            isClosed = true;
            proc.kill();
        },
    });

    return new Response(readable, {
        headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Transfer-Encoding': 'chunked',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
