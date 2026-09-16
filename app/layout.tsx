import type { Metadata, Viewport } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Juntos',
  description: 'Ver una película a la vez, aunque estéis en dos casas.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Juntos',
  formatDetection: { telephone: false },
  // Con esto, al añadirla a la pantalla de inicio en iOS se abre sin barra de
  // Safari y con la barra de estado integrada en el fondo oscuro.
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Juntos' },
};

export const viewport: Viewport = {
  themeColor: '#0a0710',
  width: 'device-width',
  initialScale: 1,
  // Necesario para que `env(safe-area-inset-*)` llegue hasta los bordes.
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
