<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-38bdf8?style=for-the-badge&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/yt--dlp-latest-red?style=for-the-badge&logo=youtube" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-a855f7?style=for-the-badge&logo=framer" />
</p>

<h1 align="center">📺 MediaHub — YouTube Downloader</h1>

<p align="center">
  A sleek, premium media downloader web app built with <strong>Next.js 15</strong> and <strong>yt-dlp</strong>.
  Paste any YouTube URL and instantly get MP4 or MP3 download options in every available quality.
</p>

<p align="center">
  <strong>Created by <a href="https://github.com/dan-delion-source">dan-delion-source</a></strong>
</p>

---

## ✨ Features

- 🎬 **Video downloads** — MP4 in every available resolution (4K, 2K, 1080p, 720p … 144p) with file size previews
- 🎵 **Audio downloads** — MP3 at Best Quality, 320 kbps, 192 kbps, or 128 kbps
- 🖼️ **Media preview** — real thumbnail, title, channel, view count, and duration fetched live
- ⚡ **Streaming downloads** — yt-dlp output is piped directly to the browser; no intermediate file storage needed
- 🌑 **Premium dark UI** — glassmorphism cards, animated gradient background, particle canvas, micro-animations (Framer Motion)
- 📱 **Fully responsive** — adapts from mobile to wide desktop layouts

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Styling | [TailwindCSS v3](https://tailwindcss.com/) + custom CSS (glassmorphism) |
| Animations | [Framer Motion 12](https://www.framer-motion.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Downloader | [yt-dlp](https://github.com/yt-dlp/yt-dlp) (Python CLI, called server-side) |
| Language | TypeScript |

---

## 📐 How It Works

```
User pastes URL  →  /api/info  →  yt-dlp --dump-json  →  returns metadata + format list
User clicks Download  →  /api/download  →  yt-dlp (stdout pipe)  →  streamed to browser
```

1. **`/api/info`** — calls `yt-dlp --dump-json <url>` server-side, parses the JSON, and returns title, thumbnail, duration, channel, views, and a deduplicated list of video formats (by resolution).
2. **`/api/download`** — spawns `yt-dlp` with the chosen format and pipes its stdout directly into a `ReadableStream` response with the correct `Content-Disposition` header so the browser downloads it automatically.
3. The **frontend** is a pure Next.js client component that calls these two routes, renders the results with Framer Motion animations, and manages toast notifications.

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18 or newer |
| npm | 9 or newer |
| Python | 3.8+ |
| yt-dlp | latest |
| ffmpeg | any recent build (required for merging video+audio and MP3 conversion) |

### 1. Install yt-dlp

```bash
# Linux / macOS (recommended)
pip3 install -U yt-dlp

# Or via pipx
pipx install yt-dlp
```

### 2. Install ffmpeg

```bash
# Ubuntu / Debian
sudo apt install ffmpeg

# macOS (Homebrew)
brew install ffmpeg

# Windows — download from https://ffmpeg.org/download.html and add to PATH
```

### 3. Clone the repository

```bash
git clone https://github.com/dan-delion-source/Youtube-Downloader.git
cd Youtube-Downloader
```

### 4. Install Node dependencies

```bash
npm install
```

### 5. Configure yt-dlp path *(if needed)*

By default, the API routes expect yt-dlp at `/home/dandadan/.local/bin/yt-dlp`.

If your yt-dlp is installed elsewhere (e.g. `/usr/local/bin/yt-dlp` or just `yt-dlp` on PATH), update the constant in both API files:

```ts
// src/app/api/info/route.ts
// src/app/api/download/route.ts
const YTDLP = 'yt-dlp'; // ← change to your path or just 'yt-dlp' if it's on PATH
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

### 7. *(Optional)* Production build

```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Main client page (state, handlers)
│   ├── layout.tsx                # Root layout + metadata
│   ├── globals.css               # Global styles, glassmorphism utilities
│   └── api/
│       ├── info/route.ts         # GET /api/info  — yt-dlp metadata
│       └── download/route.ts     # GET /api/download — yt-dlp stream
├── components/
│   ├── URLInputCard.tsx          # Hero section + URL input form
│   ├── ThumbnailPreview.tsx      # Video info card with thumbnail
│   ├── VideoDownloadPanel.tsx    # MP4 quality list
│   ├── AudioDownloadPanel.tsx    # MP3 quality list
│   ├── DownloadItem.tsx          # Individual download row with progress bar
│   ├── LoadingSpinner.tsx        # Animated loading state
│   ├── ToastContainer.tsx        # Toast notifications
│   └── ParticleBackground.tsx   # Canvas particle animation
└── types/
    └── index.ts                  # TypeScript interfaces
```

---

## ⚠️ Legal Notice

This tool is intended **for legally permitted content only** — videos you own, content licensed for download, or videos where the creator has granted permission. Downloading copyrighted content without permission may violate YouTube's Terms of Service and applicable copyright law. Use responsibly.

---

## 🙏 Credits

**Built by [dan-delion-source](https://github.com/dan-delion-source)**

Powered by:
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) — the backbone of the download engine
- [Next.js](https://nextjs.org/) by Vercel
- [Framer Motion](https://www.framer-motion.com/) by Framer
- [Lucide Icons](https://lucide.dev/)
- [TailwindCSS](https://tailwindcss.com/)

---

<p align="center">Made with ❤️ by <a href="https://github.com/dan-delion-source">dan-delion-source</a></p>
