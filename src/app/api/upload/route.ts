import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // Validate size (e.g. 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
        }

        const supabase = getServiceClient(); // Service Role bypasses RLS for upload
        const ext = file.name.split('.').pop() || 'png';
        const filename = `${crypto.randomUUID()}.${ext}`;

        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const { data, error } = await supabase
            .storage
            .from('logos')
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (error) {
            console.error('Storage upload error:', error);
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('logos')
            .getPublicUrl(filename);

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
