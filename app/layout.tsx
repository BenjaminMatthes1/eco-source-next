// app/layout.tsx
import './globals.css';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { SessionProvider } from 'next-auth/react';
import Providers from './providers';

export const metadata = {
  title: 'Eco-Source',
  description: 'Empowering a Sustainable Future, One Connection at a Time',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="mytheme">
      <body>
        <Providers>{children}</Providers>
      </body>
      <Footer/>
    </html>
  );
}
