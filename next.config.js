/** @type {import('next').NextConfig} */
const privatePage = [
    { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    { key: 'Referrer-Policy', value: 'no-referrer' },
    { key: 'Cache-Control', value: 'no-store' },
];

const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                ],
            },
            { source: '/edit/:path*', headers: privatePage },
            { source: '/recover/:path*', headers: privatePage },
            { source: '/success', headers: privatePage },
            { source: '/admin', headers: privatePage },
        ];
    },
};

module.exports = nextConfig;
