import { Montserrat } from 'next/font/google';
import Header from "@/components/Header";
import BackgroundMusic from "@/components/BackgroundMusic";
import { GameProvider } from '@/context/GameContext';
import { SerwistProvider } from "@serwist/turbopack/react";
import "./globals.css";

const montserrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-montserrat',
});

export const metadata = {
    title: "Csupaszív Kalandok: A Homokhátság Hősei",
    description: "Interaktív történetmesélő játék",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Csupaszív",
    },
    formatDetection: {
        telephone: false,
    },
    icons: {
        apple: "/icons/icon-192x192.png",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="hu" className={montserrat.variable}>
            <body className={`${montserrat.className} antialiased text-surface`}>
                <SerwistProvider swUrl="/serwist/sw.js">
                    <GameProvider>
                        <BackgroundMusic />
                        <Header />
                        <main>
                            {children}
                        </main>
                    </GameProvider>
                </SerwistProvider>
            </body>
        </html>
    );
}
