import Header from "@/components/Header";
import { GameProvider } from '@/context/GameContext';
import "./globals.css";

export const metadata = {
    title: "Csupaszív Kaland",
    description: "Interaktív történetmesélő játék",
};

export default function RootLayout({ children }) {
    return (
        <html lang="hu">
            <body className="antialiased bg-zinc-950 text-orange-50/90">
                <GameProvider>
                    <Header />
                    <main className="pt-24 sm:pt-16">
                        {children}
                    </main>
                </GameProvider>
            </body>
        </html>
    );
}
