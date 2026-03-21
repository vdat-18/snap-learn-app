import api from './api';
import type { CaptureResponse } from '../store/gameStore';

// --- Capture API ---

export const captureApi = {
    /**
     * Send a captured image to the AI vision pipeline
     */
    capture: async (image_base64: string): Promise<CaptureResponse> => {
        const { data } = await api.post('/capture', { image_base64 });
        return data;
    },
};
