/**
 * MediaRecorder settings for pronunciation clips sent to /api/pronounce.
 * Safari records MP4/AAC; Chrome/Firefox typically use WebM/Opus. MIME must match bytes.
 */
export function pickPronunciationRecorderMimeType(): string | undefined {
    if (typeof MediaRecorder === 'undefined') return undefined;
    const candidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4;codecs=mp4a.40.2',
        'audio/mp4',
    ];
    for (const mimeType of candidates) {
        if (MediaRecorder.isTypeSupported(mimeType)) return mimeType;
    }
    return undefined;
}

export function createPronunciationMediaRecorder(stream: MediaStream): MediaRecorder {
    const mimeType = pickPronunciationRecorderMimeType();
    return mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
}

export function pronunciationBlobType(recorder: MediaRecorder): string {
    return recorder.mimeType || 'audio/webm';
}
