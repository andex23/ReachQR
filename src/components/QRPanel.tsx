'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { copyText } from './CopyButton';
import { CheckIcon, DownloadIcon, PrinterIcon, ShareIcon } from './icons';

const INK = '#141414';
const PAPER = '#F6F4EF';
const ACCENT = '#D4F25A';

interface Props {
    url: string;
    slug: string;
    businessName: string;
    compact?: boolean;
}

function triggerDownload(href: string, filename: string) {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.click();
}

function cssFont(variable: string, fallback: string) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return value || fallback;
}

/** Fit text into maxWidth by shrinking the font size. */
function fitText(ctx: CanvasRenderingContext2D, text: string, family: string, weight: number, start: number, maxWidth: number) {
    let size = start;
    do {
        ctx.font = `${weight} ${size}px ${family}`;
        size -= 4;
    } while (ctx.measureText(text).width > maxWidth && size > 24);
}

async function renderPoster(url: string, businessName: string): Promise<string> {
    const W = 1240;
    const H = 1754; // A-series ratio
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    const display = cssFont('--font-display', 'system-ui, sans-serif');
    const mono = cssFont('--font-mono', 'monospace');

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);

    // Card
    const pad = 90;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.roundRect(pad + 18, pad + 18, W - pad * 2, H - pad * 2, 56);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(pad, pad, W - pad * 2, H - pad * 2, 56);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = INK;

    // Badge
    const badge = 'SCAN TO CONTACT US';
    ctx.font = `600 34px ${mono}`;
    const bw = ctx.measureText(badge).width + 64;
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.roundRect((W - bw) / 2, 200, bw, 76, 38);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.fillText(badge, W / 2, 251);

    // Name
    fitText(ctx, businessName, display, 800, 110, W - pad * 2 - 120);
    ctx.fillText(businessName, W / 2, 420);

    // QR
    const qrSize = 820;
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, url, { width: qrSize, margin: 1, errorCorrectionLevel: 'M', color: { dark: INK, light: '#FFFFFF' } });
    ctx.drawImage(qrCanvas, (W - qrSize) / 2, 500, qrSize, qrSize);

    // Footer
    ctx.font = `500 40px ${mono}`;
    ctx.fillStyle = '#555555';
    ctx.fillText(url.replace(/^https?:\/\//, ''), W / 2, 1420);
    ctx.font = `600 36px ${display}`;
    ctx.fillStyle = INK;
    ctx.fillText('WhatsApp · Call · Email · Directions', W / 2, 1500);

    return canvas.toDataURL('image/png');
}

export default function QRPanel({ url, slug, businessName, compact = false }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [shared, setShared] = useState(false);

    useEffect(() => {
        if (canvasRef.current && url) {
            QRCode.toCanvas(canvasRef.current, url, {
                width: compact ? 200 : 260,
                margin: 1,
                errorCorrectionLevel: 'M',
                color: { dark: INK, light: '#FFFFFF' },
            });
        }
    }, [url, compact]);

    const run = (name: string, fn: () => Promise<void>) => async () => {
        setBusy(name);
        try {
            await fn();
        } catch (err) {
            console.error(err);
        }
        setBusy(null);
    };

    const downloadPng = run('png', async () => {
        const data = await QRCode.toDataURL(url, { width: 1200, margin: 2, errorCorrectionLevel: 'M', color: { dark: INK, light: '#FFFFFF' } });
        triggerDownload(data, `${slug}-qr.png`);
    });

    const downloadSvg = run('svg', async () => {
        const svg = await QRCode.toString(url, { type: 'svg', margin: 2, errorCorrectionLevel: 'M', color: { dark: INK, light: '#FFFFFF' } });
        const blobUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
        triggerDownload(blobUrl, `${slug}-qr.svg`);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    });

    const downloadPoster = run('poster', async () => {
        await document.fonts?.ready;
        triggerDownload(await renderPoster(url, businessName), `${slug}-sign.png`);
    });

    const share = run('share', async () => {
        try {
            const data = await QRCode.toDataURL(url, { width: 800, margin: 2, color: { dark: INK, light: '#FFFFFF' } });
            const blob = await (await fetch(data)).blob();
            const file = new File([blob], `${slug}-qr.png`, { type: 'image/png' });
            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({ files: [file], title: businessName, text: `Contact ${businessName}: ${url}` });
                return;
            }
            if (navigator.share) {
                await navigator.share({ title: businessName, url });
                return;
            }
        } catch (err) {
            if ((err as Error)?.name === 'AbortError') return;
        }
        await copyText(url);
        setShared(true);
        setTimeout(() => setShared(false), 1800);
    });

    return (
        <div className="flex flex-col items-center">
            <div className="rounded-2xl border-2 border-ink bg-white p-3 shadow-hard">
                <canvas ref={canvasRef} className="block rounded-lg" aria-label={`QR code for ${url}`} role="img" />
            </div>

            <div className="mt-6 grid w-full grid-cols-2 gap-2.5">
                <button type="button" onClick={downloadPng} disabled={!!busy} className="btn-primary col-span-2 py-3">
                    <DownloadIcon />
                    {busy === 'png' ? 'Preparing…' : 'Download PNG'}
                </button>
                <button type="button" onClick={downloadSvg} disabled={!!busy} className="btn-secondary py-2.5 text-sm">
                    SVG for print
                </button>
                <button type="button" onClick={share} disabled={!!busy} className="btn-secondary py-2.5 text-sm">
                    {shared ? <CheckIcon className="h-4 w-4" /> : <ShareIcon className="h-4 w-4" />}
                    {shared ? 'Link copied' : 'Share'}
                </button>
                <button type="button" onClick={downloadPoster} disabled={!!busy} className="btn-accent col-span-2 py-2.5 text-sm">
                    <PrinterIcon className="h-4 w-4" />
                    {busy === 'poster' ? 'Designing…' : 'Download printable sign'}
                </button>
            </div>
        </div>
    );
}
