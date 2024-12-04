import localFont from "next/font/local";
import "./globals.css";
import Header from '../components/Header';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Header/>

        {/* Main Content */}
        <main className="flex-grow container mx-auto py-6 px-4">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-4 px-6">
          <div className="container mx-auto text-center">
            <p>© 2024 DisasterWatch. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

