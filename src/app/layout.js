import { Montserrat } from 'next/font/google';
import Header from "@/components/Header";
import BackgroundMusic from "@/components/BackgroundMusic";
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
            <body className={`${montserrat.className} antialiased text-surface`}>
                <GameProvider>
                    <BackgroundMusic />
                    <Header />
                    <main className="pb-16 lg:pb-0">
                        {children}
                    </main>
                </GameProvider>
            </body>
        </html>
    );
}
