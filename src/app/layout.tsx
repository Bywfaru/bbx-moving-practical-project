import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { FC } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BBX Moving | Practical Project - Moving Quote Form',
  description: 'William He - (778) 895-5428',
};

const RootLayout: FC<LayoutProps<'/'>> = ({ children }) => {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
    <body className="min-h-full flex flex-col py-10 px-5">{children}</body >
    </html >
  );
};

export default RootLayout;
