import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { getClientIp, handleRouteError, jsonError, rateLimit, tooManyRequests } from '@/lib/server-utils';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
};

export async function POST(request: NextRequest) {
    try {
        if (!(await rateLimit(`upload:${getClientIp(request)}`, 10, 60 * 10))) return tooManyRequests();

        const formData = await request.formData();
        const file = formData.get('file');

        if (!(file instanceof File)) return jsonError('No file provided', 400);

        const ext = EXTENSIONS[file.type];
        if (!ext) return jsonError('Please upload a PNG, JPG, WebP or GIF image', 400);
        if (file.size > MAX_BYTES) return jsonError('Image must be smaller than 5MB', 400);

        const supabase = getServiceClient();
        const filename = `${crypto.randomUUID()}.${ext}`;

        const { error } = await supabase.storage
            .from('logos')
            .upload(filename, new Uint8Array(await file.arrayBuffer()), {
                contentType: file.type,
                cacheControl: '31536000',
                upsert: false,
            });

        if (error) throw error;

        const {
            data: { publicUrl },
        } = supabase.storage.from('logos').getPublicUrl(filename);

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        return handleRouteError(error, 'Upload');
    }
}
