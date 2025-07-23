import type { Metadata } from 'next';
import './globals.css';
import { TRPCReactProvider } from '@/server/trpc/react';

export const metadata: Metadata = {
  title: 'CRU App Template',
  description: 'high quality organic application starter',
  keywords: ['App Template'],
  authors: [{ name: 'CRU devs' }],
  creator: 'CRU devs',
  publisher: 'CRU devs',
  openGraph: {
    title: 'CRU App Template',
    description: 'high quality organic application starter',
    siteName: 'CRU App template',
    images: [
      {
        url: '/thumbnail.jpg',
        width: 1200,
        height: 630,
        alt: 'CRU thumbnail',
      },
    ],
    type: 'website',
  },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'Hilgard631 - Wine',
  //   description: 'Discover and purchase premium Hilgard631 wines online.',
  //   images: ['https://hilgard631.org/thumbnail.jpg'],
  // },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body data-theme='gunrock' className={`antialiased`}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
