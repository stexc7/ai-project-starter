import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'DENY' },
        // El micrófono sí, que el chat de voz es nuestro. Cámara y ubicación no
        // se usan en ningún sitio, así que se cierran del todo.
        { key: 'Permissions-Policy', value: 'microphone=(self), camera=(), geolocation=()' },
      ],
    },
  ],
};

export default nextConfig;
