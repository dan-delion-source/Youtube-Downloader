import path from 'path';
import fs from 'fs';
import https from 'https';

// Helper to recursively fetch following redirects
function fetchWithRedirects(url: string, fileStream: fs.WriteStream): Promise<void> {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'mediahub/1.0' } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                if (!res.headers.location) return reject(new Error('Redirect missing location header'));
                fetchWithRedirects(res.headers.location, fileStream).then(resolve).catch(reject);
            } else if (res.statusCode === 200) {
                res.pipe(fileStream);
                fileStream.on('finish', () => resolve());
            } else {
                reject(new Error(`Failed to download: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
}

// Helper to reliably find or download yt-dlp on Vercel
export async function ensureYtdlp(): Promise<string> {
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

    console.log('[lib/ytdlp] yt-dlp missing in bundle, downloading to /tmp...');
    const file = fs.createWriteStream(tmpPath);
    try {
        await fetchWithRedirects('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux', file);
        file.close();
        fs.chmodSync(tmpPath, 0o755);
        return tmpPath;
    } catch (err) {
        file.close();
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        throw err;
    }
}
