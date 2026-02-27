import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import { ensureYtdlp } from '@/lib/ytdlp';

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
        const isVercel = process.env.VERCEL === '1';

        // Map UI quality labels to yt-dlp values
        const qualityMap: Record<string, string> = {
            best: '0',
            '320': '320K',
            '192': '192K',
            '128': '128K',
        };
        const ytQuality = qualityMap[audioQuality] ?? '0';

        args.push('-f', 'bestaudio');

        if (!isVercel) {
            // Extract best audio and convert to mp3
            args.push(
                '-x',
                '--audio-format', 'mp3',
                '--audio-quality', ytQuality,
            );
            filename = 'audio.mp3';
            contentType = 'audio/mpeg';
        } else {
            // Vercel doesn't have ffmpeg, so we must just download the native audio format without converting
            filename = 'audio.webm'; // generic audio extension, could be m4a or webm depending on YouTube
            contentType = 'audio/webm';
        }
    } else {
        const isVercel = process.env.VERCEL === '1';

        if (isVercel) {
            // Vercel doesn't have ffmpeg. We should just pass the format ID (which we ensured had both video+audio during info fetch)
            const formatStr = quality ? quality : 'best';
            args.push('-f', formatStr);
            filename = 'video.mp4';
            contentType = 'video/mp4';
        } else {
            // Video: use the given format_id merged with best audio
            const formatStr = quality ? `${quality}+bestaudio/best` : 'bestvideo+bestaudio/best';
            args.push('-f', formatStr, '--merge-output-format', 'mp4');
            filename = 'video.mp4';
            contentType = 'video/mp4';
        }
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
