import Header from "@/components/Header";
import BackgroundMusic from "@/components/BackgroundMusic";
import { GameProvider } from '@/context/GameContext';
import { SerwistProvider } from "@serwist/turbopack/react";
import "./globals.css";

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
        <html lang="hu">
            <head>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=lexend:400,500,600,700|montserrat:400,500,600,700,800,900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="antialiased text-surface">
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
