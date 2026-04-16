import { Montserrat } from 'next/font/google';
import Header from "@/components/Header";
import { GameProvider } from '@/context/GameContext';
import "./globals.css";

const montserrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-montserrat',
});

export const metadata = {
    title: "Csupaszív kalandok: A Homokhátság Hősei",
    description: "Interaktív történetmesélő játék",
};

export default function RootLayout({ children }) {
    return (
        <html lang="hu" className={montserrat.variable}>
            <body className={`${montserrat.className} antialiased min-h-screen bg-fixed text-surface bg-linear-to-b from-[#87ceeb] to-[#f5deb3]`}>
                <GameProvider>
                    <Header />
                    <main className="pb-16 lg:pb-0">
                        {children}
                    </main>
                </GameProvider>
            </body>
        </html>
    );
}
