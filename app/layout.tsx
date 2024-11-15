// app/layout.tsx
import './globals.css';
import NavBar from '@/components/layout/NavBar';
import Footer from '@/components/layout/Footer';
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
        <Providers>
          <NavBar />   {/* NavBar will display on all pages */}
          <main style={{ paddingTop: '4rem' }}>{children}</main> {/* Offset by navbar height */}
          <Footer />  {/* Footer will display on all pages */}
        </Providers>
      </body>
    </html>
  );
}