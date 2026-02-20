export interface VideoFormat {
    formatId: string;
    label: string;
    resolution: string;
    ext: string;
    filesize: number | null;
}

export interface MediaData {
    title: string;
    thumbnail: string;
    duration: string;
    channel: string;
    views: string;
    videoFormats: VideoFormat[];
}

export interface DownloadOption {
    label: string;
    quality: string;
    size: string;
    format: 'mp4';
}

export interface AudioOption {
    label: string;
    bitrate: string;
    size: string;
    format: 'mp3';
}

export interface Toast {
    id: string;
    type: 'info' | 'success' | 'error';
    message: string;
}
