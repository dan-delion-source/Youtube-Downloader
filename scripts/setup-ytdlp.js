/**
 * setup-ytdlp.js
 * Downloads the yt-dlp standalone binary into ./bin/ at build time.
 * This ensures the binary is present both locally and on Vercel.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const BIN_DIR = path.join(process.cwd(), 'bin');
const YTDLP_PATH = path.join(BIN_DIR, 'yt-dlp');

// Skip download if a custom path is set via env (e.g. local dev with system install)
if (process.env.YTDLP_PATH) {
    console.log(`[setup-ytdlp] YTDLP_PATH env set to "${process.env.YTDLP_PATH}", skipping download.`);
    process.exit(0);
}

// Skip if binary already exists and is executable
if (fs.existsSync(YTDLP_PATH)) {
    console.log(`[setup-ytdlp] yt-dlp already present at ${YTDLP_PATH}, skipping download.`);
    process.exit(0);
}

fs.mkdirSync(BIN_DIR, { recursive: true });

console.log('[setup-ytdlp] Downloading yt-dlp binary...');

// Use curl if available (faster on Linux), else fallback to Node https
try {
    execSync(
        `curl -L --progress-bar https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o "${YTDLP_PATH}"`,
        { stdio: 'inherit' }
    );
    fs.chmodSync(YTDLP_PATH, 0o755);
    console.log(`[setup-ytdlp] yt-dlp downloaded to ${YTDLP_PATH}`);
} catch {
    // Fallback: Node https download
    console.log('[setup-ytdlp] curl failed, falling back to Node https...');
    const file = fs.createWriteStream(YTDLP_PATH);
    https.get(
        'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux',
        { headers: { 'User-Agent': 'setup-ytdlp/1.0' } },
        (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                https.get(res.headers.location, (res2) => {
                    res2.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        fs.chmodSync(YTDLP_PATH, 0o755);
                        console.log(`[setup-ytdlp] yt-dlp downloaded to ${YTDLP_PATH}`);
                    });
                });
            } else {
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    fs.chmodSync(YTDLP_PATH, 0o755);
                    console.log(`[setup-ytdlp] yt-dlp downloaded to ${YTDLP_PATH}`);
                });
            }
        }
    ).on('error', (err) => {
        fs.unlinkSync(YTDLP_PATH);
        console.error('[setup-ytdlp] Download failed:', err.message);
        process.exit(1);
    });
}
