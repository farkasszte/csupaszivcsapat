import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Csupaszív Kalandok',
    short_name: 'Csupaszív',
    description: 'Interaktív természetvédelmi kalandjáték a Homokhátságon',
    start_url: '/',
    display: 'standalone',
    background_color: '#F9FBF8',
    theme_color: '#4F7942',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
