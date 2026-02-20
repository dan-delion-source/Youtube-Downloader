import { NextRequest } from 'next/server';
import { spawn } from 'child_process';

const YTDLP = '/home/dandadan/.local/bin/yt-dlp';

export const maxDuration = 300; // allow up to 5 min streaming

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');
    const type = req.nextUrl.searchParams.get('type'); // 'video' | 'audio'
    const quality = req.nextUrl.searchParams.get('quality'); // format_id for video
    const audioQuality = req.nextUrl.searchParams.get('audioQuality') ?? 'best'; // 'best'|'320'|'192'|'128'

    if (!url || !type) {
        return new Response(JSON.stringify({ error: 'Missing url or type' }), { status: 400 });
    }

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

    const proc = spawn(YTDLP, args);

    // Convert Node.js stream to Web ReadableStream
    const readable = new ReadableStream({
        start(controller) {
            proc.stdout.on('data', (chunk: Buffer) => {
                controller.enqueue(new Uint8Array(chunk));
            });
            proc.stdout.on('end', () => {
                controller.close();
            });
            proc.stderr.on('data', (chunk: Buffer) => {
                // yt-dlp writes progress to stderr — just log it
                console.log('[yt-dlp stderr]', chunk.toString());
            });
            proc.on('error', (err) => {
                console.error('[yt-dlp process error]', err);
                controller.error(err);
            });
            proc.on('close', (code) => {
                if (code !== 0) {
                    console.error(`[yt-dlp] exited with code ${code}`);
                }
            });
        },
        cancel() {
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
